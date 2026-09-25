"""SEALED (D-015). pt-pl-w2-box-by-the-cot, the Blender test (D-084).
Brief: a shoebox-sized box against her camp's wall, a thin slate laid across its lid with a count, and on the slate a
tin mug upside down; tin, slate, cardboard gone soft, cut stone behind; the clay lamp's light from the doorway (warm,
weak); low, near the floor, VP along the wall; look at the upside-down mug; a single glint on the mug's rim.
The room is pt-b-1.C's (her camp), rebuilt from its numbers. Here the camera sits low by the back corner and looks
along the left wall toward the doorway, so the lamp's light comes toward us and the doorway is the far glow.

  python pt-pl-w2-box-by-the-cot.py <out.png> [scale] [samples]
"""
import math, os, random, sys
import bpy, bmesh
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lib
from lib import K

ID = 'pt-pl-w2-box-by-the-cot'
B = (-1.585, 2.35)                                     # the box, against the left wall (kit x, z)
random.seed(7)
CAM = (-1.25, .31, 1.86)                               # crouched low near the wall, a short step from the box
TILT, RTURN = 4.5, -29.                                 # the mug: tipped toward us; turned so the handle is side-on
KEY, FILL, GLINT = 1.6, 3., 40.                         # watts
sc = lib.reset()

# ---------- the room: her camp (pt-b-1.C), cut from the rock ----------
stone = lib.stone_mat(dark_above=(.1, .5, 1., .1), dark_near=(2.15, 3.3, .12, 1.))   # walls dark overhead; the floor near us out of the light
rock = lib.box('rock', (0, 1.3, .2), (2.3, 1.6, 4.3), stone)
air = [lib.arch_room(1.7, 1., 1.7, 0., 3.9),
       lib.box('door', (0, .78, -1.6), (.68, .78, 1.65)),
       lib.box('passage', (0, 1.15, -2.), (.68, 1.15, 1.6))]
lib.carve(rock, air)
lib.box('threshold', (0, .02, -.12), (.69, .02, .1), lib.simple_mat('worn stone', (.3, .29, .35), .7, bump=.2), bevel=.01)


def deform(ob, fn):
    """Move an object's vertices by fn(kit point) -> kit point (modifiers applied first)."""
    bpy.context.view_layer.objects.active = ob
    for m in list(ob.modifiers):
        bpy.ops.object.modifier_apply(modifier=m.name)
    for v in ob.data.vertices:
        p = fn(Vector((v.co.x, v.co.z, v.co.y)))
        v.co = K(*p)


def soften(ob, levels=2):
    m = ob.modifiers.new('sub', 'SUBSURF'); m.levels = m.render_levels = levels
    bpy.context.view_layer.objects.active = ob
    bpy.ops.object.modifier_apply(modifier=m.name)


# ---------- the box: grey card gone soft ----------
card = lib.bpy.data.materials.new('card')
nt, nd, lk, bs = lib.nodes_of(card)
tc = nd.new('ShaderNodeTexCoord')
n1 = lib.noise(nd, lk, 9., 6., .6, tc.outputs['Object'])
r1 = lib.ramp(nd, lk, n1.outputs['Fac'], (.11, .11, .115), (.2, .2, .205), .3, .75)   # grey card, blotched with damp
lk.new(r1.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = .95; bs.inputs['Sheen Weight'].default_value = .5; bs.inputs['Sheen Roughness'].default_value = .6
n2 = lib.noise(nd, lk, 140., 8., .7, tc.outputs['Object'])                             # the fibres
bm_ = nd.new('ShaderNodeBump'); bm_.inputs['Strength'].default_value = .25; bm_.inputs['Distance'].default_value = .001
lk.new(n2.outputs['Fac'], bm_.inputs['Height']); lk.new(bm_.outputs['Normal'], bs.inputs['Normal'])
# the damp: a tideline a few centimetres up, the card below it darker where it wicked the floor's wet
sp_ = nd.new('ShaderNodeSeparateXYZ'); lk.new(tc.outputs['Object'], sp_.inputs[0])
nw = lib.noise(nd, lk, 24., 3., .5, tc.outputs['Object'])
wz = nd.new('ShaderNodeMath'); wz.operation = 'MULTIPLY_ADD'; lk.new(nw.outputs['Fac'], wz.inputs[0]); wz.inputs[1].default_value = .012
lk.new(sp_.outputs['Z'], wz.inputs[2])
wr = nd.new('ShaderNodeValToRGB'); lk.new(wz.outputs[0], wr.inputs['Fac'])
els = wr.color_ramp.elements
els[0].position = .0; els[0].color = (.5, .5, .52, 1)
els[1].position = .03; els[1].color = (.78, .78, .8, 1)
for pos, v in ((.034, .66), (.037, .72), (.042, 1.)):
    e_ = els.new(pos); e_.color = (v, v, v * 1.02, 1)
dm = nd.new('ShaderNodeMix'); dm.data_type = 'RGBA'; dm.blend_type = 'MULTIPLY'; dm.inputs['Factor'].default_value = 1
lk.new(r1.outputs['Color'], dm.inputs[6]); lk.new(wr.outputs['Color'], dm.inputs[7]); lk.new(dm.outputs[2], bs.inputs['Base Color'])

bx, bz = B
body = lib.box('box', (bx, .047, bz), (.088, .047, .138), card, bevel=.007, segs=4, cuts=14)
lid = lib.box('lid', (bx, .1, bz), (.094, .016, .144), card, bevel=.005, segs=4, cuts=14)


def slump(p):
    q = p - Vector((bx, 0, bz))
    # the sides bellied a little, the top sagging in the middle, one far corner crushed in
    bel = .004 * max(0., 1 - abs(q.y - .05) / .05)
    q.x += math.copysign(bel, q.x) * (1 - (q.z / .15) ** 2)
    if q.y > .08:
        q.y -= .012 * max(0., 1 - (q.x / .1) ** 2) * max(0., 1 - (q.z / .15) ** 2)
    c = Vector((.095, .075, -.15)); d = (q - c).length                     # the near corner, toward us, crushed in
    if d < .085:
        q += (Vector((0, .05, 0)) - c).normalized() * .024 * (1 - d / .085) ** 2
    n = math.sin(q.x * 90 + q.z * 40) * math.sin(q.y * 70 + q.z * 55)
    q.x += .0012 * n; q.z += .0008 * n
    return q + Vector((bx, 0, bz))


deform(body, slump); deform(lid, slump)

# ---------- the slate, laid across the lid a little askew, a count cut in it ----------
slate_m = lib.simple_mat('slate', (.1, .1, .115), .55, bump=.12, bscale=40.)
cut_m = lib.simple_mat('slate cut', (.3, .29, .31), .85)                                # scratched: paler than the face
SA = math.radians(9.)                                   # turned a few degrees: laid across, not fitted
S0 = Vector((bx + .014, .1245, bz + .012))              # its centre, on the lid's top
slate = lib.box('slate', (0, 0, 0), (.078, .0045, .112), slate_m, cuts=12)


def riven(p):
    # split, not sawn: the outline wanders, the face is a little uneven in layers
    a = math.atan2(p.z, p.x)
    w = .0035 * math.sin(a * 7 + 1.3) + .0022 * math.sin(a * 17 + .4) + .0012 * math.sin(a * 41)
    if abs(p.x) > .077 or abs(p.z) > .111:
        s_ = 1 + w / max(math.hypot(p.x, p.z), .01)
        p = Vector((p.x * s_, p.y, p.z * s_))
    if p.y > 0:
        p.y += .0006 * math.sin(p.x * 70 + p.z * 23) + .0004 * math.sin(p.z * 150)
    return p


deform(slate, riven)
cutters = []
zk = -.1
for k in range(7):
    L = .006 + .007 * random.random(); lean = (random.random() - .5) * .35
    zk += .011 + .01 * random.random()
    c = lib.box('stroke', (-.03 + (random.random() - .5) * .01, .0047, zk), (L, .0012, .0009), cut_m, bevel=.0008, segs=1)
    c.rotation_euler = (0, 0, lean)
    cutters.append(c)
for c in cutters:
    m = slate.modifiers.new('cut', 'BOOLEAN'); m.operation = 'DIFFERENCE'; m.solver = 'EXACT'; m.object = c
    m.material_mode = 'TRANSFER'
bpy.context.view_layer.objects.active = slate
for m in list(slate.modifiers):
    bpy.ops.object.modifier_apply(modifier=m.name)
for c in cutters:
    bpy.data.objects.remove(c)
slate.rotation_euler = (0, 0, -SA); slate.location = K(*S0)

# ---------- the tin mug (Meshy, D-084), upside down on the slate, the side toward us lifted off it ----------
# Meshy's shape, our material: its baked colour and light would fight the scene's. Brushed dull tin, dented.
tin = bpy.data.materials.new('tin')
nt, nd, lk, bs = lib.nodes_of(tin)
tc = nd.new('ShaderNodeTexCoord')
bv = nd.new('ShaderNodeVectorMath'); bv.operation = 'MULTIPLY'; bv.inputs[1].default_value = (4., 4., 120.)   # brushed: stretched along the height
lk.new(tc.outputs['Object'], bv.inputs[0])
n1 = lib.noise(nd, lk, 1., 6., .6, bv.outputs[0])
r1 = lib.ramp(nd, lk, n1.outputs['Fac'], (.34, 0, 0), (.58, 0, 0), .3, .7)
sepr = nd.new('ShaderNodeSeparateColor'); lk.new(r1.outputs['Color'], sepr.inputs[0]); lk.new(sepr.outputs[0], bs.inputs['Roughness'])
n2 = lib.noise(nd, lk, 3., 3., .5, tc.outputs['Object'])
r2 = lib.ramp(nd, lk, n2.outputs['Fac'], (.36, .36, .38), (.5, .5, .53), .35, .7)        # dull grey tin, a little uneven
lk.new(r2.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Metallic'].default_value = 1.
bs.inputs['Anisotropic'].default_value = .6
bmp = nd.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = .15; bmp.inputs['Distance'].default_value = .0004
lk.new(n1.outputs['Fac'], bmp.inputs['Height']); lk.new(bmp.outputs['Normal'], bs.inputs['Normal'])
rim_m = lib.simple_mat('rim', (.62, .62, .64), .12, metal=1.)                             # the worn bead: polished by use

H = .088
bpy.ops.import_scene.gltf(filepath=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'assets', 'mug.glb'))
mug = bpy.context.selected_objects[0]; mug.name = 'mug'
bpy.context.view_layer.objects.active = mug
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
me = mug.data
zs = [v.co.z for v in me.vertices]; z0, z1 = min(zs), max(zs)
ys = [v.co.y for v in me.vertices]; xs = [v.co.x for v in me.vertices]
k = H / (z1 - z0); R = (max(ys) - min(ys)) / 2 * k                  # the body's radius (the handle is along +x)
ax = min(xs) * k + R                                                   # its axis: the handle widens the model's box
for v in me.vertices:
    v.co = Vector((v.co.x * k - ax, v.co.y * k, (v.co.z - z0) * k))
me.materials.clear(); me.materials.append(tin)
# dents, deeper than the scan's, so they break the highlight
for v in me.vertices:
    p = v.co; r = math.hypot(p.x, p.y); a = math.atan2(p.y, p.x)
    if .008 < p.z < H - .008 and R - .006 < r < R + .004 and abs(a) > .6:           # the wall only, not the handle
        dent = 0.
        for a0, zc, s_, dk in ((-2.2, .05, .45, .0045), (2.0, .03, .35, .0032), (-1.0, .066, .3, .0036), (2.9, .07, .3, .003)):
            da = math.atan2(math.sin(a - a0), math.cos(a - a0))
            dent += dk * math.exp(-(da / s_) ** 2 - ((p.z - zc) / .014) ** 2)
        p.x -= math.cos(a) * dent; p.y -= math.sin(a) * dent
# the rolled rim: its own object, so the lamp's last light can be given to it alone
bm = bmesh.new(); bm.from_mesh(me)
top = [f_ for f_ in bm.faces if min(v.co.z for v in f_.verts) > H - .0045 and min(math.hypot(v.co.x, v.co.y) for v in f_.verts) > R - .008]
rim_bm = bmesh.new()
vm = {}
for f_ in top:
    vs = []
    for v in f_.verts:
        if v not in vm:
            vm[v] = rim_bm.verts.new(v.co)
        vs.append(vm[v])
    try:
        rim_bm.faces.new(vs)
    except ValueError:
        pass
bmesh.ops.delete(bm, geom=top, context='FACES')
bm.to_mesh(me); bm.free()
rim = lib.obj_from_bm('rim', rim_bm, rim_m, smooth=True)
me.shade_smooth()
# upside down: the rim on the slate; tipped so the side toward us lifts and a dark sliver of the inside shows
TOP = S0.y + .0045
turn = Matrix.Rotation(math.radians(RTURN), 4, 'Z')        # the handle to the room's side, seen side-on
flip = Matrix.Rotation(math.pi, 4, 'X')
_to = Vector((CAM[0] - (S0.x + .012), 0, CAM[2] - (S0.z + .05)))                   # toward the camera (kit x, z)
_ax = K(-_to.z, 0, _to.x).normalized()                                              # the horizontal axis across it
tilt = Matrix.Rotation(math.radians(TILT), 4, _ax)
M = tilt @ flip @ turn
low = min((M @ v.co).z for ob in (mug, rim) for v in ob.data.vertices)
for ob in (mug, rim):
    ob.matrix_world = Matrix.Translation(K(S0.x + .012, TOP, S0.z + .05) - Vector((0, 0, low))) @ M
MUG = (S0.x + .012, TOP + H / 2, S0.z + .05)

props = [body, lid, slate, mug, rim]

# ---------- her shelf on the back wall, with the rod (pt-b-1.C) ----------
wood = lib.simple_mat('wood', (.16, .11, .08), .75, bump=.15, bscale=80.)
lib.box('shelf', (-.5, 1.2, 3.84), (.44, .018, .12), wood, bevel=.004)
lib.box('rod', (-.5, 1.235, 3.82), (.21, .012, .014), lib.simple_mat('rod stone', (.05, .05, .06), .4), bevel=.005)
for x in (-.8, -.2):
    lib.box('peg', (x, 1.16, 3.85), (.016, .016, .06), wood, bevel=.006)

for ob in (body, lid):
    bpy.context.view_layer.objects.active = ob; ob.select_set(True)
    bpy.ops.object.shade_smooth_by_angle(angle=math.radians(40)); ob.select_set(False)

# ---------- light: one warm key, violet fill, one peak ----------
lib.world((.008, .006, .016), 1.)
WARM = (1., .62, .3)
# the key: the clay lamp's light, weak, from the doorway side behind us, laid low on the box's near face and the floor
lib.area('clay lamp', (-1.0, .35, 1.6), (B[0] + .06, 0., B[1] - .2), WARM, KEY, .35)
# the violet half-light of her camp: from the far corners, and a large low fill from our side so no dark is black
lib.spot('violet, far left', (-1.05, 1.1, 3.3), (B[0] + .05, .08, B[1] + .05), (.50, .40, .84), 12., 38., 1., .5)
lib.area('violet along the wall', (-.9, .8, 3.6), (-1.7, .25, 2.2), (.50, .40, .84), 12., 1.)   # grazes the left wall: its blocks and stains
lib.area('violet, far right', (1.35, 1.9, 3.7), (-1., .8, 3.), (.50, .40, .84), 1.2, 1.)
lib.point('violet, the far corner', (-1.45, .5, 3.8), (.56, .44, .92), 10., .2)   # the far glow
lib.area('violet, from our side', (-1.0, .5, 1.3), (B[0], .1, B[1]), (.50, .40, .84), FILL, 1.6, only=[rock, slate, mug])   # not the box: it would outshine the mug
lib.area('violet on the tin', (-1.2, .4, 2.55), (MUG[0], .15, MUG[2]), (.56, .46, .9), 3., .2, only=[mug])

for ob in bpy.data.objects:
    if ob.type == 'LIGHT':
        ob.visible_camera = False

# ---------- camera: low by the wall, pitched down so the mug's closed base reads as a disc ----------
lib.camera(CAM, lib.forward(CAM, -20., -30.), f=1.2, fstop=5.6, focus=MUG)
# the glint: the lamp's last light, one point on the rim's front, where the bead mirrors the key into the eye
_c = Vector(CAM); _k = Vector((-1.0, .35, 1.6))
_rv = [rim.matrix_world @ v.co for v in rim.data.vertices]
_rv = [Vector((p.x, p.z, p.y)) for p in _rv]                       # back to kit coordinates
_bis = ((_c - Vector(MUG)).normalized() + (_k - Vector(MUG)).normalized()); _bis.y = 0; _bis.normalize()
_P = max(_rv, key=lambda p: (p - Vector((MUG[0], p.y, MUG[2]))).normalized().dot(_bis) - 30 * abs(p.y - min(q.y for q in _rv) - .004))
_lp = _P + (_k - _P).normalized() * .5
g = lib.spot('lamp on the rim', tuple(_lp), tuple(_P), WARM, GLINT, 4., .3, .002, only=[rim]); g.visible_camera = False
lib.comp(haze=(.03, .022, .06), haze_k=.45, mist=(.5, 3.5), glow=.35)

ANCHORS = {'glints': [{'p': [round(_P.x, 4), round(_P.y, 4), round(_P.z, 4)]}], 'beam': [{'p': [-.4, 1.1, .6], 'w': .35}]}

if __name__ == '__main__':
    out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else sys.argv[1]
    args = sys.argv[sys.argv.index(out) + 1:]
    scale = float(args[0]) if args else 1.
    samples = int(args[1]) if len(args) > 1 else 128
    import json
    with open(out.replace('.png', '.anchors.json'), 'w') as f:
        json.dump(lib.anchors(ANCHORS), f)
    lib.render(out, samples, scale)
