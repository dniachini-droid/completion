"""The Blender painting pipeline (D-084). SEALED folder (D-015): scene files quote the briefs.

Coordinates are the kit's (x right, y up, z into the room, metres), so rooms and cameras carry over from
app/paint/places/*.js; K() turns them into Blender's (x, y forward, z up). Cycles on the CPU with the
OpenImageDenoise denoiser (the official bpy wheel; the system Blender has no denoiser), then a compositor
pass (depth haze from the mist pass, a soft glow), then post.py (grade, grain, webp + anchors json).
"""
import math, os, bpy, bmesh
from mathutils import Vector, Matrix


def K(x, y, z):
    return Vector((x, z, y))


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.device = 'CPU'
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 4
    sc.cycles.glossy_bounces = 3
    sc.cycles.caustics_reflective = False
    sc.cycles.caustics_refractive = False
    sc.cycles.light_sampling_threshold = .002
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.film_transparent = False
    w = bpy.data.worlds.new('world'); sc.world = w
    w.use_nodes = True
    return sc


# ---------- meshes ----------

def obj_from_bm(name, bm, mat=None, smooth=False):
    me = bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    if smooth:
        me.shade_smooth()
    ob = bpy.data.objects.new(name, me); bpy.context.collection.objects.link(ob)
    if mat:
        me.materials.append(mat)
    return ob


def box(name, c, h, mat=None, bevel=0., segs=3, cuts=0):
    """A box in kit coordinates: centre c, half extents h (cuts: subdivided, for deforming)."""
    bm = bmesh.new(); bmesh.ops.create_cube(bm, size=1.)
    if cuts:
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=cuts, use_grid_fill=True)
    bmesh.ops.scale(bm, vec=Vector((2 * h[0], 2 * h[2], 2 * h[1])), verts=bm.verts)
    bmesh.ops.translate(bm, vec=K(*c), verts=bm.verts)
    ob = obj_from_bm(name, bm, mat)
    if bevel:
        m = ob.modifiers.new('bevel', 'BEVEL'); m.width = bevel; m.segments = segs
        m.limit_method = 'ANGLE'; m.harden_normals = False
    return ob


def prism(name, pts, z0, z1, mat=None):
    """A section in the kit's x-y plane (a closed polygon), extruded from z0 to z1."""
    bm = bmesh.new()
    vs = [bm.verts.new(K(x, y, z0)) for x, y in pts]
    f = bm.faces.new(vs)
    ext = bmesh.ops.extrude_face_region(bm, geom=[f])
    moved = [e for e in ext['geom'] if isinstance(e, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=Vector((0, z1 - z0, 0)), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(name, bm, mat)


def arch_room(w, s, r, z0, z1, n=48):
    """The kit's hallAir as a solid of air: half width w, springing height s, arch radius r (r = w: round)."""
    cx = w - r
    pts = [(-w, 0.), (w, 0.), (w, s)]
    a0 = math.acos(max(-1., min(1., (w - cx) / r)))
    top = []
    for i in range(1, n):
        th = a0 + (math.pi / 2 - a0) * i / n
        top.append((cx + r * math.cos(th), s + r * math.sin(th)))
    pts += top + [(0., s + math.sqrt(r * r - cx * cx))] + [(-x, y) for x, y in reversed(top)] + [(-w, s)]
    return prism('air', pts, z0, z1)


def carve(block, cutters):
    for c in cutters:
        m = block.modifiers.new('cut', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = c
        c.hide_render = True; c.hide_viewport = True
    bpy.context.view_layer.objects.active = block
    for m in list(block.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    for c in cutters:
        bpy.data.objects.remove(c)


def lathe(name, prof, segs=96, mat=None):
    """Spin a profile [(r, h), ...] (kit y up) around the vertical axis; r = 0 points become poles."""
    bm = bmesh.new(); rings = []
    for r, h in prof:
        if r < 1e-6:
            rings.append([bm.verts.new((0, 0, h))])
        else:
            rings.append([bm.verts.new((r * math.cos(2 * math.pi * i / segs), r * math.sin(2 * math.pi * i / segs), h)) for i in range(segs)])
    for a, b in zip(rings, rings[1:]):
        for i in range(segs):
            j = (i + 1) % segs
            if len(a) == 1 and len(b) == 1:
                continue
            if len(a) == 1:
                bm.faces.new((a[0], b[j], b[i]))
            elif len(b) == 1:
                bm.faces.new((a[i], a[j], b[0]))
            else:
                bm.faces.new((a[i], a[j], b[j], b[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(name, bm, mat, smooth=True)


# ---------- materials ----------

def nodes_of(mat):
    mat.use_nodes = True
    nt = mat.node_tree
    return nt, nt.nodes, nt.links, nt.nodes['Principled BSDF']


def noise(nd, lk, scale, detail=4., rough=.55, vec=None):
    n = nd.new('ShaderNodeTexNoise'); n.inputs['Scale'].default_value = scale
    n.inputs['Detail'].default_value = detail; n.inputs['Roughness'].default_value = rough
    if vec is not None:
        lk.new(vec, n.inputs['Vector'])
    return n


def ramp(nd, lk, src, a, b, pa=0., pb=1.):
    r = nd.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].position = pa; r.color_ramp.elements[1].position = pb
    r.color_ramp.elements[0].color = (*a, 1); r.color_ramp.elements[1].color = (*b, 1)
    lk.new(src, r.inputs['Fac'])
    return r


def stone_mat(name='cut stone', c=(.34, .30, .40), course=(.75, .34), slab=(.95, .7), rough=.82,
              joint=.58, floor_joint=.74, jw=.011, dark_above=None, dark_near=None):
    """The hall's cut stone (app/src/ui/scene/hall.js stone()), as nodes: courses on walls and vault, slabs on the floor.
    Per block a value (.82-1.12), a large stain (+-22 %), water streaks, chisel grain, and joints drawn darker
    (x joint, the hall's JD) and soft, with the arris bevelled toward them. Shared by every Blender place."""
    mat = bpy.data.materials.new(name); nt, nd, lk, bs = nodes_of(mat)
    geo = nd.new('ShaderNodeNewGeometry'); tc = nd.new('ShaderNodeTexCoord')
    sp = nd.new('ShaderNodeSeparateXYZ'); lk.new(tc.outputs['Object'], sp.inputs[0])
    sn = nd.new('ShaderNodeSeparateXYZ'); lk.new(geo.outputs['Normal'], sn.inputs[0])

    def comb(a, b):
        cc = nd.new('ShaderNodeCombineXYZ'); lk.new(a, cc.inputs[0]); lk.new(b, cc.inputs[1]); return cc.outputs[0]

    def brick(vec, bw, rh, off=.5):
        b = nd.new('ShaderNodeTexBrick')
        wob = nd.new('ShaderNodeTexNoise'); wob.inputs['Scale'].default_value = 2.2; wob.inputs['Detail'].default_value = 2.
        lk.new(vec, wob.inputs['Vector'])
        vm = nd.new('ShaderNodeVectorMath'); vm.operation = 'MULTIPLY_ADD'; vm.inputs[1].default_value = (.03, .025, .03)
        lk.new(wob.outputs['Color'], vm.inputs[0]); lk.new(vec, vm.inputs[2]); lk.new(vm.outputs[0], b.inputs['Vector'])   # hand-cut: joints wander
        b.inputs['Scale'].default_value = 1.; b.inputs['Brick Width'].default_value = bw; b.inputs['Row Height'].default_value = rh
        b.inputs['Mortar Size'].default_value = jw; b.inputs['Mortar Smooth'].default_value = .7
        b.offset = off; b.inputs['Bias'].default_value = 0.; b.offset_frequency = 2; b.squash = 1.
        b.inputs['Color1'].default_value = (.82, .82, .82, 1); b.inputs['Color2'].default_value = (1.12, 1.12, 1.12, 1)   # each block its own value
        b.inputs['Mortar'].default_value = (1, 1, 1, 1)
        return b
    bx = brick(comb(sp.outputs['Y'], sp.outputs['Z']), *course)          # walls facing x (and the vault)
    by = brick(comb(sp.outputs['X'], sp.outputs['Z']), *course)          # walls facing z
    bf = brick(comb(sp.outputs['X'], sp.outputs['Y']), *slab)            # the floor
    ay = nd.new('ShaderNodeMath'); ay.operation = 'ABSOLUTE'; lk.new(sn.outputs['Y'], ay.inputs[0])
    fy = nd.new('ShaderNodeMath'); fy.operation = 'GREATER_THAN'; lk.new(ay.outputs[0], fy.inputs[0]); fy.inputs[1].default_value = .6
    fz = nd.new('ShaderNodeMath'); fz.operation = 'GREATER_THAN'; lk.new(sn.outputs['Z'], fz.inputs[0]); fz.inputs[1].default_value = .7

    def mix(fac, a, b, t='RGBA'):
        m = nd.new('ShaderNodeMix'); m.data_type = t
        lk.new(fac, m.inputs['Factor']); lk.new(a, m.inputs[6 if t == 'RGBA' else 2]); lk.new(b, m.inputs[7 if t == 'RGBA' else 3])
        return m.outputs[2 if t == 'RGBA' else 0]

    def mul(a, b):
        m = nd.new('ShaderNodeMix'); m.data_type = 'RGBA'; m.blend_type = 'MULTIPLY'; m.inputs['Factor'].default_value = 1
        lk.new(a, m.inputs[6]); lk.new(b, m.inputs[7]); return m.outputs[2]

    def jdark(bk, k):
        # the joint as a drawn line: k times the stone's value (Fac is 1 in the joint, soft at its edge)
        r = ramp(nd, lk, bk.outputs['Fac'], (1, 1, 1), (k, k, k), 0., 1.)
        return mul(bk.outputs['Color'], r.outputs['Color'])
    tone = mix(fz.outputs[0], mix(fy.outputs[0], jdark(bx, joint), jdark(by, joint)), jdark(bf, floor_joint))
    mfac = mix(fz.outputs[0], mix(fy.outputs[0], bx.outputs['Fac'], by.outputs['Fac'], 'FLOAT'), bf.outputs['Fac'], 'FLOAT')
    base = nd.new('ShaderNodeRGB'); base.outputs[0].default_value = (*c, 1)
    last = mul(base.outputs[0], tone)
    # the large stain, the water run down it, the chisel
    n1 = noise(nd, lk, 2.2, 4., .55, tc.outputs['Object'])
    last = mul(last, ramp(nd, lk, n1.outputs['Fac'], (.74, .74, .76), (1.24, 1.2, 1.24), .3, .7).outputs['Color'])
    st = nd.new('ShaderNodeVectorMath'); st.operation = 'MULTIPLY'; st.inputs[1].default_value = (4., 4., .35)   # streaks: stretched up the wall
    lk.new(tc.outputs['Object'], st.inputs[0])
    n2 = noise(nd, lk, 1., 3., .5, st.outputs[0])
    last = mul(last, ramp(nd, lk, n2.outputs['Fac'], (.86, .86, .88), (1.1, 1.1, 1.1), .35, .65).outputs['Color'])
    n3 = noise(nd, lk, 26., 5., .6, tc.outputs['Object'])
    last = mul(last, ramp(nd, lk, n3.outputs['Fac'], (.84, .84, .85), (1.12, 1.12, 1.12), .3, .7).outputs['Color'])
    # a painter's shading of the room, as the kit's gTint: the stone darker overhead, the floor darker near the eye
    for spec, axis in ((dark_above, 'Z'), (dark_near, 'Y')):
        if not spec:
            continue
        a0, a1, k0, k1 = spec
        mr = nd.new('ShaderNodeMapRange'); mr.clamp = True; mr.interpolation_type = 'SMOOTHSTEP'
        lk.new(sp.outputs[axis], mr.inputs['Value'])
        mr.inputs['From Min'].default_value = a0; mr.inputs['From Max'].default_value = a1
        mr.inputs['To Min'].default_value = k0; mr.inputs['To Max'].default_value = k1
        cc = nd.new('ShaderNodeCombineColor'); [lk.new(mr.outputs[0], cc.inputs[i]) for i in range(3)]
        last = mul(last, cc.outputs[0])
    lk.new(last, bs.inputs['Base Color'])
    bs.inputs['Roughness'].default_value = rough
    # relief: the arris bevelled into the joint, the chisel on the face
    h = nd.new('ShaderNodeMath'); h.operation = 'MULTIPLY_ADD'; lk.new(mfac, h.inputs[0]); h.inputs[1].default_value = -1.; h.inputs[2].default_value = 1.
    n4 = noise(nd, lk, 30., 6., .65, tc.outputs['Object'])
    hh = nd.new('ShaderNodeMath'); hh.operation = 'MULTIPLY_ADD'; lk.new(n4.outputs['Fac'], hh.inputs[0]); hh.inputs[1].default_value = .22; lk.new(h.outputs[0], hh.inputs[2])
    bump = nd.new('ShaderNodeBump'); bump.inputs['Strength'].default_value = .6; bump.inputs['Distance'].default_value = .012
    lk.new(hh.outputs[0], bump.inputs['Height']); lk.new(bump.outputs['Normal'], bs.inputs['Normal'])
    return mat


def simple_mat(name, color, rough=.8, metal=0., bump=0., bscale=30., sheen=0., coat=0.):
    mat = bpy.data.materials.new(name); nt, nd, lk, bs = nodes_of(mat)
    bs.inputs['Base Color'].default_value = (*color, 1); bs.inputs['Roughness'].default_value = rough
    bs.inputs['Metallic'].default_value = metal
    bs.inputs['Sheen Weight'].default_value = sheen
    bs.inputs['Coat Weight'].default_value = coat
    if bump:
        tc = nd.new('ShaderNodeTexCoord'); n = noise(nd, lk, bscale, 6., .6, tc.outputs['Object'])
        b = nd.new('ShaderNodeBump'); b.inputs['Strength'].default_value = bump; b.inputs['Distance'].default_value = .002
        lk.new(n.outputs['Fac'], b.inputs['Height']); lk.new(b.outputs['Normal'], bs.inputs['Normal'])
    return mat


def emit_mat(name, color, k):
    mat = bpy.data.materials.new(name); nt, nd, lk, bs = nodes_of(mat)
    bs.inputs['Base Color'].default_value = (0, 0, 0, 1)
    bs.inputs['Emission Color'].default_value = (*color, 1); bs.inputs['Emission Strength'].default_value = k
    return mat


# ---------- light and camera ----------

def point(name, p, color, watts, radius=.05, shadow=True, only=None):
    li = bpy.data.lights.new(name, 'POINT'); li.color = color; li.energy = watts; li.shadow_soft_size = radius
    li.use_shadow = shadow
    ob = bpy.data.objects.new(name, li); ob.location = K(*p); bpy.context.collection.objects.link(ob)
    link(ob, only)
    return ob


def spot(name, p, at, color, watts, angle=30., blend=.8, radius=.02, only=None):
    li = bpy.data.lights.new(name, 'SPOT'); li.color = color; li.energy = watts; li.shadow_soft_size = radius
    li.spot_size = math.radians(angle); li.spot_blend = blend
    ob = bpy.data.objects.new(name, li); ob.location = K(*p); bpy.context.collection.objects.link(ob)
    aim(ob, K(*at)); link(ob, only)
    return ob


def area(name, p, at, color, watts, size=1., only=None):
    li = bpy.data.lights.new(name, 'AREA'); li.color = color; li.energy = watts; li.size = size
    ob = bpy.data.objects.new(name, li); ob.location = K(*p); bpy.context.collection.objects.link(ob)
    aim(ob, K(*at)); link(ob, only)
    return ob


def link(light, only):
    """Light linking: this light reaches only the given objects (a painter's accent, like the kit's `reach`)."""
    if not only:
        return
    col = bpy.data.collections.new(light.name + ' reaches')
    for o in only:
        col.objects.link(o)
    light.light_linking.receiver_collection = col


def aim(ob, target):
    d = target - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def forward(pos, pitch, yaw):
    """The point one metre ahead of a kit camera (pitch, yaw in degrees; yaw + turns toward +x)."""
    p, y = math.radians(pitch), math.radians(yaw)
    return (pos[0] + math.sin(y) * math.cos(p), pos[1] + math.sin(p), pos[2] + math.cos(y) * math.cos(p))


def camera(pos, at, f=1.0, fstop=0., focus=None, W=1320, H=2868):
    """f as in the kit: focal length as a fraction of the image width."""
    sc = bpy.context.scene
    cam = bpy.data.cameras.new('cam'); cam.sensor_fit = 'HORIZONTAL'; cam.sensor_width = 36.; cam.lens = f * 36.
    cam.clip_start = .02; cam.clip_end = 30.
    if fstop:
        cam.dof.use_dof = True; cam.dof.aperture_fstop = fstop
        cam.dof.focus_distance = (K(*focus) - K(*pos)).length if focus else 1.
    ob = bpy.data.objects.new('cam', cam); ob.location = K(*pos); bpy.context.collection.objects.link(ob)
    aim(ob, K(*at)); sc.camera = ob
    sc.render.resolution_x, sc.render.resolution_y = W, H
    return ob


def world(color, strength):
    bg = bpy.context.scene.world.node_tree.nodes['Background']
    bg.inputs['Color'].default_value = (*color, 1); bg.inputs['Strength'].default_value = strength


# ---------- render ----------

def comp(haze=(.02, .018, .05), haze_k=.35, mist=(.3, 9.), glow=.35):
    """Compositor: depth haze (the kit's fog) from the mist pass, then a soft fog glow (the kit's bloom)."""
    sc = bpy.context.scene
    sc.view_layers[0].use_pass_mist = True
    sc.world.mist_settings.start, sc.world.mist_settings.depth = mist
    sc.world.mist_settings.falloff = 'QUADRATIC'
    sc.use_nodes = True
    nt = sc.node_tree; nd = nt.nodes; lk = nt.links
    for n in list(nd):
        nd.remove(n)
    rl = nd.new('CompositorNodeRLayers'); out = nd.new('CompositorNodeComposite')
    mul = nd.new('CompositorNodeMath'); mul.operation = 'MULTIPLY'; mul.inputs[1].default_value = haze_k
    lk.new(rl.outputs['Mist'], mul.inputs[0])
    mx = nd.new('CompositorNodeMixRGB'); mx.blend_type = 'MIX'
    lk.new(mul.outputs[0], mx.inputs['Fac']); lk.new(rl.outputs['Image'], mx.inputs[1]); mx.inputs[2].default_value = (*haze, 1)
    last = mx.outputs[0]
    if glow:
        g = nd.new('CompositorNodeGlare'); g.glare_type = 'FOG_GLOW'; g.quality = 'HIGH'; g.threshold = .6; g.size = 8; g.mix = glow - 1.
        lk.new(last, g.inputs['Image']); last = g.outputs['Image']
    lk.new(last, out.inputs['Image'])


def render(out_png, samples=128, scale=1.):
    sc = bpy.context.scene
    sc.cycles.samples = samples
    sc.render.resolution_percentage = int(round(scale * 100))
    sc.render.image_settings.file_format = 'PNG'; sc.render.image_settings.color_depth = '16'
    sc.render.filepath = out_png
    crop = os.environ.get('CROP')                   # drafts: CROP=u0,u1,v0,v1 renders just that part of the frame
    if crop:
        u0, u1, v0, v1 = map(float, crop.split(','))
        sc.render.use_border = True; sc.render.use_crop_to_border = True
        sc.render.border_min_x, sc.render.border_max_x = u0, u1
        sc.render.border_min_y, sc.render.border_max_y = 1 - v1, 1 - v0
    bpy.ops.render.render(write_still=True)


def anchors(spec, W=1320, H=2868):
    """The live layers' anchors, projected as the kit does (u, v from the top-left; s = f / depth)."""
    from bpy_extras.object_utils import world_to_camera_view
    bpy.context.view_layer.update()                 # the camera's matrix is stale until the scene updates
    sc = bpy.context.scene; cam = sc.camera; f = cam.data.lens / cam.data.sensor_width
    out = {}
    for k, lst in spec.items():
        out[k] = []
        for a in lst:
            co = world_to_camera_view(sc, cam, K(*a['p']))
            if co.z > .05:
                out[k].append({**a, 'u': round(co.x, 4), 'v': round(1 - co.y, 4), 's': round(f / co.z, 4)})
    return out
