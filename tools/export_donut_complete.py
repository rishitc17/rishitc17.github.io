"""Export evaluated surfaces and every sprinkle instance; never save the source file."""
import bpy, os, json
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'assets','Clean Donut.blend'))
scene=bpy.context.scene
for image in bpy.data.images:
    if not image.filepath or image.packed_file: continue
    original=os.path.basename(image.filepath.replace('\\','/'))
    library=os.path.join(os.path.expanduser('~'),'Poliigon','Library',original.rsplit('_',1)[0])
    for resolution in ('2K','4K','1K'):
        candidate=os.path.join(library,resolution,original)
        if os.path.isfile(candidate): image.filepath=candidate;image.reload();break
# The source node output is named "Instances". Do not filter it by "Geometry".
for o in scene.objects:
    for m in o.modifiers:
        if m.type=='SUBSURF':m.levels=min(m.levels,2);m.render_levels=m.levels
deps=bpy.context.evaluated_depsgraph_get()
instances=[(i.object.original.name,i.matrix_world.copy(),i.random_id) for i in deps.object_instances if i.is_instance and i.parent and i.parent.original.name=='Icing']
assert len(instances)>100, f'Missing sprinkle instances: {len(instances)}'
targets=[]
for name in ('Doughnut','Icing'):
    source=bpy.data.objects[name];evaluated=source.evaluated_get(deps)
    mesh=bpy.data.meshes.new_from_object(evaluated,preserve_all_data_layers=True,depsgraph=deps)
    obj=bpy.data.objects.new('Web_'+name,mesh);scene.collection.objects.link(obj);obj.matrix_world=source.matrix_world.copy()
    for slot in obj.material_slots:
        if slot.material:slot.material=slot.material.copy()
    targets.append(obj)
palette=bpy.data.materials['Sprinkle']
ramp=next(n for n in palette.node_tree.nodes if n.type=='VALTORGB').color_ramp
sprinkle_materials={};sprinkles=[]
for index,(name,matrix,random_id) in enumerate(instances):
    source=bpy.data.objects[name];evaluated=source.evaluated_get(deps)
    mesh=bpy.data.meshes.new_from_object(evaluated,depsgraph=deps)
    obj=bpy.data.objects.new('Web_Sprinkle_'+str(index),mesh);scene.collection.objects.link(obj);obj.matrix_world=matrix
    color=tuple(ramp.evaluate((random_id&0xffffffff)/4294967295));key=tuple(round(c,5) for c in color)
    if key not in sprinkle_materials:
        mat=bpy.data.materials.new('Sprinkle_color_'+str(len(sprinkle_materials)));mat.use_nodes=True
        shader=next(n for n in mat.node_tree.nodes if n.type=='BSDF_PRINCIPLED')
        shader.inputs['Base Color'].default_value=color;shader.inputs['Roughness'].default_value=.33;sprinkle_materials[key]=mat
    mesh.materials.clear();mesh.materials.append(sprinkle_materials[key]);sprinkles.append(obj)
assert len(sprinkle_materials)>=6,'Sprinkle palette was lost'
scene.render.engine='CYCLES';scene.cycles.samples=8;scene.cycles.device='CPU'
scene.render.bake.use_pass_direct=False;scene.render.bake.use_pass_indirect=False;scene.render.bake.use_pass_color=True;scene.render.bake.margin=12
for obj in targets:
    bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
    source_uv=obj.data.uv_layers.active.name
    for slot in obj.material_slots:
        mat=slot.material
        if not mat:continue
        for node in list(mat.node_tree.nodes):
            if node.type=='TEX_COORD':
                for link in list(node.outputs['UV'].links):
                    uv=mat.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map=source_uv
                    destination=link.to_socket;mat.node_tree.links.remove(link);mat.node_tree.links.new(uv.outputs['UV'],destination)
    obj.data.uv_layers.new(name='WebBake');obj.data.uv_layers.active_index=len(obj.data.uv_layers)-1
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
    baked=[]
    for slot in obj.material_slots:
        mat=slot.material
        if not mat:continue
        texture=bpy.data.images.new(obj.name+'_'+mat.name,width=1024,height=1024)
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=texture;mat.node_tree.nodes.active=tex;baked.append((mat,texture))
    bpy.ops.object.bake(type='DIFFUSE')
    for mat,texture in baked:
        mat.node_tree.nodes.clear();out=mat.node_tree.nodes.new('ShaderNodeOutputMaterial');shader=mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=texture;uv=mat.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map='WebBake'
        mat.node_tree.links.new(uv.outputs['UV'],tex.inputs['Vector']);mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
        shader.inputs['Roughness'].default_value=.34 if obj.name=='Web_Icing' else .73
        mat.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface']);texture.pack()
bpy.ops.object.select_all(action='DESELECT')
for o in sprinkles:o.select_set(True)
bpy.context.view_layer.objects.active=sprinkles[0];bpy.ops.object.join();sprinkles[0].name='Web_Sprinkles';targets.append(sprinkles[0])
bpy.ops.object.select_all(action='DESELECT')
for o in targets:o.select_set(True)
os.makedirs(os.path.join(ROOT,'assets','models'),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'assets','models','donut.glb'),export_format='GLB',use_selection=True,export_image_format='JPEG',export_jpeg_quality=90,export_texcoords=True,export_normals=True)
print('WEB_EXPORT_COMPLETE',len(instances),'sprinkles',len(sprinkle_materials),'colors',flush=True)
for o in scene.objects:
    if o.type=='MESH':o.hide_render=o not in targets
scene.cycles.samples=24;scene.render.resolution_x=960;scene.render.resolution_y=800;scene.render.resolution_percentage=100;scene.render.film_transparent=True
camera=scene.camera;camera.location=(.43,-.56,.50);camera.rotation_euler=(Vector((0,0,.08))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=.46;camera.data.dof.use_dof=False
scene.render.image_settings.file_format='PNG';scene.render.filepath=os.path.join(ROOT,'assets','images','donut-poster.png');bpy.ops.render.render(write_still=True)
os.makedirs(os.path.join(ROOT,'.taste-skill'),exist_ok=True)
with open(os.path.join(ROOT,'.taste-skill','export-proof.json'),'w') as f:json.dump({'sprinkle_instances':len(instances),'palette_colors':len(sprinkle_materials),'meshes':[o.name for o in targets]},f,indent=2)
print('POSTER_COMPLETE',flush=True)
