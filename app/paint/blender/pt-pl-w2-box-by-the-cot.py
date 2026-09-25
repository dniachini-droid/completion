"""SEALED (D-015). pt-pl-w2-box-by-the-cot, the Blender test (D-076).
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
sc = lib.reset()

# ---------- the room: her camp (pt-b-1.C), cut from the rock ----------
stone = lib.stone_mat(dark_above=(.12, .65, 1., .09), dark_near=(2.15, 3.3, .12, 1.))   # walls dark overhead; the floor near us out of the light
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
r1 = lib.ramp(nd, lk, n1.outputs['Fac'], (.17, .17, .175), (.30, .30, .305), .3, .75)   # pale grey card, blotched with damp
lk.new(r1.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Roughness'].default_value = .95; bs.inputs['Sheen Weight'].default_value = .5; bs.inputs['Sheen Roughness'].default_value = .6
n2 = lib.noise(nd, lk, 140., 8., .7, tc.outputs['Object'])                             # the fibres
bm_ = nd.new('ShaderNodeBump'); bm_.inputs['Strength'].default_value = .25; bm_.inputs['Distance'].default_value = .001
lk.new(n2.outputs['Fac'], bm_.inputs['Height']); lk.new(bm_.outputs['Normal'], bs.inputs['Normal'])

bx, bz = B
body = lib.box('box', (bx, .047, bz), (.088, .047, .138), card, bevel=.007, segs=4, cuts=14)
lid = lib.box('lid', (bx, .1, bz), (.094, .016, .144), card, bevel=.005, segs=4, cuts=14)


def slump(p):
    q = p - Vector((bx, 0, bz))
    # the sides bellied a little, the top sagging in the middle, one far corner crushed in
    bel = .004 * max(0., 1 - abs(q.y - .05) / .05)
    q.x += math.copysign(bel, q.x) * (1 - (q.z / .15) ** 2)
    if q.y > .08:
        q.y -= .006 * max(0., 1 - (q.x / .1) ** 2) * max(0., 1 - (q.z / .15) ** 2)
    c = Vector((.09, .115, -.145)); d = (q - c).length
    if d < .07:
        q += (Vector((0, 0, 0)) - c).normalized() * .014 * (1 - d / .07) ** 2
    n = math.sin(q.x * 90 + q.z * 40) * math.sin(q.y * 70 + q.z * 55)
    q.x += .0012 * n; q.z += .0008 * n
    return q + Vector((bx, 0, bz))


deform(body, slump); deform(lid, slump)

# ---------- the slate, laid across the lid a little askew, a count cut in it ----------
slate_m = lib.simple_mat('slate', (.055, .058, .07), .5, bump=.08, bscale=60.)
cut_m = lib.simple_mat('slate cut', (.2, .2, .22), .8)
SA = math.radians(9.)                                   # turned a few degrees: laid across, not fitted
S0 = Vector((bx + .014, .1245, bz + .012))              # its centre, on the lid's top
slate = lib.box('slate', (0, 0, 0), (.078, .0045, .112), slate_m, bevel=.0025, segs=2)
cutters = []
for k in range(7):
    L = .01 + .003 * random.random(); lean = (random.random() - .5) * .25
    z = -.098 + k * .0165 + (random.random() - .5) * .004
    c = lib.box('stroke', (-.028 + (random.random() - .5) * .006, .0045, z), (L, .0024, .0011), cut_m, bevel=.0009, segs=2)
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

# ---------- the tin mug, upside down on the slate, one side of its rim just lifted ----------
tin = bpy.data.materials.new('tin')
nt, nd, lk, bs = lib.nodes_of(tin)
tc = nd.new('ShaderNodeTexCoord')
n1 = lib.noise(nd, lk, 30., 6., .6, tc.outputs['Object'])
r1 = lib.ramp(nd, lk, n1.outputs['Fac'], (.30, 0, 0), (.55, 0, 0), .3, .7)
sepr = nd.new('ShaderNodeSeparateColor'); lk.new(r1.outputs['Color'], sepr.inputs[0]); lk.new(sepr.outputs[0], bs.inputs['Roughness'])
n2 = lib.noise(nd, lk, 6., 4., .5, tc.outputs['Object'])
r2 = lib.ramp(nd, lk, n2.outputs['Fac'], (.36, .37, .40), (.55, .57, .62), .35, .7)     # cool grey tin, dulled in patches
lk.new(r2.outputs['Color'], bs.inputs['Base Color'])
bs.inputs['Metallic'].default_value = 1.
n3 = lib.noise(nd, lk, 220., 4., .6, tc.outputs['Object'])                              # fine scratches and pits
bmp = nd.new('ShaderNodeBump'); bmp.inputs['Strength'].default_value = .08; bmp.inputs['Distance'].default_value = .0005
lk.new(n3.outputs['Fac'], bmp.inputs['Height']); lk.new(bmp.outputs['Normal'], bs.inputs['Normal'])

H = .088
prof = [(0, .004), (.033, .004), (.0355, .0012), (.0368, 0.), (.0378, .004),              # base: a pressed ring
        (.0385, .02), (.0395, .05), (.0405, .08), (.0409, H - .0015),                      # the wall, tapering out
        (.0398, H - .0015), (.0392, .075), (.0378, .03), (.0365, .008), (.034, .0065), (0, .0065)]   # inside
mug = lib.lathe('mug', prof, 128, tin)
# dents: pushed in at a few places on the wall
for v in mug.data.vertices:
    p = v.co; r = math.hypot(p.x, p.y); a = math.atan2(p.y, p.x)
    if .01 < p.z < H - .006 and r > .036:
        dent = 0.
        for a0, z0, s_, k in ((.9, .05, .5, .0028), (2.6, .03, .35, .0018), (-1.9, .062, .4, .0022)):
            da = math.atan2(math.sin(a - a0), math.cos(a - a0))
            dent += k * math.exp(-(da / s_) ** 2 - ((p.z - z0) / .016) ** 2)
        p.x -= math.cos(a) * dent; p.y -= math.sin(a) * dent
# the rolled rim: its own piece, so the lamp's last light can be given to it alone
bpy.ops.mesh.primitive_torus_add(major_radius=.0414, minor_radius=.0019, major_segments=128, minor_segments=16, location=(0, 0, H - .0012))
rim = bpy.context.view_layer.objects.active; rim.name = 'rim'; bpy.ops.object.transform_apply(location=True); rim.data.materials.append(tin); rim.data.shade_smooth()
# the strap handle, riveted near the rim (upright: near the top): a thin strap swept along its bend
path = [(.0402, .081), (.053, .0805), (.0615, .073), (.0635, .06), (.0605, .047), (.052, .039), (.0395, .036)]   # riveted just under the rim and at the middle
def catmull(ps, n=10):
    out = []
    for i in range(len(ps) - 1):
        p0, p1, p2, p3 = ps[max(i - 1, 0)], ps[i], ps[i + 1], ps[min(i + 2, len(ps) - 1)]
        for j in range(n):
            t = j / n
            out.append(tuple(.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t * t
                               + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t ** 3) for k in (0, 1)))
    return out + [ps[-1]]
cp = catmull(path)
bm = bmesh.new(); rings = []
for i, (x, z) in enumerate(cp):
    a_, b_ = cp[max(i - 1, 0)], cp[min(i + 1, len(cp) - 1)]
    tx, tz = b_[0] - a_[0], b_[1] - a_[1]; l = math.hypot(tx, tz); nx, nz = tz / l, -tx / l
    hw, ht = .0029, .0008
    rings.append([bm.verts.new((x + nx * dn, dy, z + nz * dn)) for dn, dy in ((-ht, -hw), (ht, -hw), (ht, hw), (-ht, hw))])
for r0, r1 in zip(rings, rings[1:]):
    for k in range(4):
        bm.faces.new((r0[k], r0[(k + 1) % 4], r1[(k + 1) % 4], r1[k]))
bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
hd = lib.obj_from_bm('handle', bm, tin)
m = hd.modifiers.new('bevel', 'BEVEL'); m.width = .0006; m.segments = 2
bpy.ops.object.select_all(action='DESELECT'); mug.select_set(True); hd.select_set(True)
bpy.context.view_layer.objects.active = mug; bpy.ops.object.join()
# upside down: the rim on the slate; tipped ~2° so the side toward the room lifts a hair off it
TOP = S0.y + .0045
turn = Matrix.Rotation(math.radians(-20.), 4, 'Z')         # the handle to the room, seen side-on
flip = Matrix.Rotation(math.pi, 4, 'X')
tilt = Matrix.Rotation(math.radians(-2.4), 4, Vector((.9, .435, 0)))   # the side toward us lifts
for ob in (mug, rim):
    ob.matrix_world = Matrix.Translation(K(S0.x + .012, TOP + H + .0008 + .0008, S0.z + .052)) @ tilt @ flip @ turn
mug.data.shade_smooth()

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

# ---------- light ----------
lib.world((.006, .005, .016), 1.)
# the clay lamp, high in the passage behind us: its light comes weak through the doorway and lays its shape on the floor
lib.point('clay lamp', (-.3, 1.95, -3.), (1., .62, .28), 60., .05)
# and ends on the mug: its flank, and one line along the rim

# violet half-light: from the far corners, as in her camp, and a little over the box
lib.spot('violet, far left', (-1.05, 1.7, 3.3), (B[0] + .05, .08, B[1] + .05), (.42, .38, .9), 14., 55., 1., .5)
lib.area('violet, far right', (1.35, 1.9, 3.7), (-1., .8, 3.), (.40, .37, .85), 2., 1.)
lib.area('violet, over the box', (-1.05, .75, 2.75), (B[0], .1, B[1]), (.42, .38, .82), .5, .5)
lib.point('violet, the far corner', (-1.45, .5, 3.8), (.52, .47, 1.), 9., .2)   # the far glow
lib.area('violet from the room, over the box', (-1.25, .42, 2.62), (B[0] + .03, .1, B[1] + .06), (.58, .54, 1.), 5., .25)
lib.area('a cold lift on the tin', (-1.25, .42, 2.62), (B[0] + .03, .17, B[1] + .06), (.7, .68, 1.), 10., .2, only=[mug])

for ob in bpy.data.objects:
    if ob.type == 'LIGHT':
        ob.visible_camera = False

# ---------- camera: crouched low near the wall, a short step from the box, looking along the wall ----------
CAM = (-1.27, .26, 1.9)
MUG = (S0.x + .012, .17, S0.z + .052)
lib.camera(CAM, lib.forward(CAM, -13., -27.), f=1.2, fstop=3.5, focus=MUG)
# the lamp's last light on the rim: set where the rim's front bead mirrors it into the eye, reaching the rim alone
_c, _m = Vector(CAM), Vector((MUG[0], .1295, MUG[2]))
_to = Vector((_c.x - _m.x, 0, _c.z - _m.z)).normalized()
_P = _m + _to * .0425 + Vector((0, .0015, 0))
_V = (_c - _P).normalized(); _N = (Vector((0, 1, 0)) + _to * .6).normalized()
_L = (2 * _N.dot(_V) * _N - _V).normalized()
_lp = _P + _L * .45
for ob in [lib.spot('lamp on the rim', tuple(_lp), tuple(_P), (1., .66, .34), 6., 8., .6, .004, only=[rim]),
           lib.spot('lamp on the rim, from the doorway', (-1.12, .46, 1.62), tuple(_P), (1., .66, .34), 30., 10., .5, .006, only=[rim])]:
    ob.visible_camera = False
lib.comp(haze=(.014, .012, .036), haze_k=.5, mist=(.6, 3.5), glow=.3)

ANCHORS = {'glints': [{'p': [MUG[0] + .03, .128, MUG[2] - .02]}], 'beam': [{'p': [-.4, 1.1, .6], 'w': .35}]}

if __name__ == '__main__':
    out = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else sys.argv[1]
    args = sys.argv[sys.argv.index(out) + 1:]
    scale = float(args[0]) if args else 1.
    samples = int(args[1]) if len(args) > 1 else 128
    import json
    with open(out.replace('.png', '.anchors.json'), 'w') as f:
        json.dump(lib.anchors(ANCHORS), f)
    lib.render(out, samples, scale)
