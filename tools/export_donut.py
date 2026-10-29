"""Export the owner's geometry and bake its existing materials, leaving the .blend untouched."""
import bpy, os, math
from mathutils import Vector
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
bpy.ops.wm.open_mainfile(filepath=os.path.join(ROOT,'assets','Clean Donut.blend'))
scene=bpy.context.scene
# Relink original Poliigon textures to the matching locally installed resolution.
for image in bpy.data.images:
    if not image.filepath or image.packed_file: continue
    original=os.path.basename(image.filepath.replace('\\','/'))
    asset=original.rsplit('_',1)[0]
    library=os.path.join(os.path.expanduser('~'),'Poliigon','Library',asset)
    for resolution in ('2K','4K','1K'):
        candidate=os.path.join(library,resolution,original)
        if os.path.isfile(candidate):
            image.filepath=candidate
            image.reload()
            break
scene.render.engine='CYCLES'
scene.cycles.samples=8
scene.cycles.device='CPU'
scene.render.bake.use_pass_direct=False
scene.render.bake.use_pass_indirect=False
scene.render.bake.use_pass_color=True
scene.render.bake.margin=12
targets=[]
for name in ('Doughnut','Icing'):
    obj=bpy.data.objects[name]
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True);bpy.context.view_layer.objects.active=obj
    for modifier in list(obj.modifiers):
        if modifier.type=='SUBSURF': modifier.levels=min(modifier.levels,2);modifier.render_levels=modifier.levels
        if modifier.type=='NODES':
            # Geometry-node instances must be realised for the browser export.
            group=modifier.node_group.copy();modifier.node_group=group
            output=next(n for n in group.nodes if n.type=='GROUP_OUTPUT')
            link=next((l for l in group.links if l.to_node==output and l.to_socket.name=='Geometry'),None)
            if link:
                source=link.from_socket;group.links.remove(link)
                realise=group.nodes.new('GeometryNodeRealizeInstances')
                group.links.new(source,realise.inputs['Geometry']);group.links.new(realise.outputs['Geometry'],output.inputs['Geometry'])
        bpy.ops.object.modifier_apply(modifier=modifier.name)
    source_uv=obj.data.uv_layers.active.name
    for slot in obj.material_slots:
        if not slot.material: continue
        nodes=slot.material.node_tree.nodes;links=slot.material.node_tree.links
        for node in list(nodes):
            if node.type=='TEX_COORD':
                for link in list(node.outputs['UV'].links):
                    uv=nodes.new('ShaderNodeUVMap');uv.uv_map=source_uv
                    destination=link.to_socket
                    links.remove(link)
                    links.new(uv.outputs['UV'],destination)
    obj.data.uv_layers.new(name='WebBake')
    obj.data.uv_layers.active_index=len(obj.data.uv_layers)-1
    bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.uv.smart_project(angle_limit=1.15,island_margin=.015);bpy.ops.object.mode_set(mode='OBJECT')
    baked=[]
    for slot in obj.material_slots:
        mat=slot.material
        if not mat: continue
        image=bpy.data.images.new('Web_'+name+'_'+mat.name,width=1024,height=1024)
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
        mat.node_tree.nodes.active=tex
        baked.append((mat,image))
    bpy.ops.object.bake(type='DIFFUSE')
    for mat,image in baked:
        mat.node_tree.nodes.clear()
        out=mat.node_tree.nodes.new('ShaderNodeOutputMaterial')
        shader=mat.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        tex=mat.node_tree.nodes.new('ShaderNodeTexImage');tex.image=image
        uv=mat.node_tree.nodes.new('ShaderNodeUVMap');uv.uv_map='WebBake'
        mat.node_tree.links.new(uv.outputs['UV'],tex.inputs['Vector'])
        mat.node_tree.links.new(tex.outputs['Color'],shader.inputs['Base Color'])
        shader.inputs['Roughness'].default_value=.34 if name=='Icing' else .73
        mat.node_tree.links.new(shader.outputs['BSDF'],out.inputs['Surface'])
        image.pack()
    targets.append(obj)
bpy.ops.object.select_all(action='DESELECT')
for obj in targets: obj.select_set(True)
os.makedirs(os.path.join(ROOT,'assets','models'),exist_ok=True)
bpy.ops.export_scene.gltf(filepath=os.path.join(ROOT,'assets','models','donut.glb'),export_format='GLB',use_selection=True,export_image_format='JPEG',export_jpeg_quality=86,export_texcoords=True,export_normals=True)
print('WEB_EXPORT_COMPLETE')
# A real still of the supplied work doubles as WebGL fallback and a gallery image.
for obj in list(scene.objects):
    if obj.type=='MESH' and obj not in targets: obj.hide_render=True
scene.render.engine='CYCLES';scene.cycles.samples=24
scene.render.resolution_x=960;scene.render.resolution_y=800;scene.render.resolution_percentage=100
scene.render.film_transparent=True
camera=scene.camera
camera.location=(.43,-.56,.50)
camera.rotation_euler=(Vector((0,0,.08))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=.46;camera.data.dof.use_dof=False
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.join(ROOT,'assets','images','donut-poster.png')
bpy.ops.render.render(write_still=True)
print('POSTER_COMPLETE')
