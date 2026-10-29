"""Manage deployment using existing Git credentials, kept in process memory."""
import json,subprocess,urllib.request,urllib.error,sys
repo='rishitc17/rishitc17.github.io'
result=subprocess.run(['git','credential','fill'],input='protocol=https\nhost=github.com\n\n',text=True,capture_output=True,check=True)
credential=dict(line.split('=',1) for line in result.stdout.splitlines() if '=' in line)
token=credential.get('password')
if not token: raise SystemExit('GitHub authentication is unavailable.')
headers={'Authorization':'Bearer '+token,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2026-03-10','Content-Type':'application/json'}
def api(endpoint,method='GET',payload=None):
 request=urllib.request.Request('https://api.github.com/repos/'+repo+endpoint,headers=headers,method=method,data=json.dumps(payload).encode() if payload else None)
 with urllib.request.urlopen(request,timeout=30) as response:
  raw=response.read();return json.loads(raw) if raw else {'status':response.status}
mode=sys.argv[1] if len(sys.argv)>1 else 'status'
if mode=='configure':
 print(json.dumps(api('/pages','PUT',{'build_type':'workflow'})))
elif mode=='status':
 data=api('/actions/workflows/pages.yml/runs?per_page=1')
 print(json.dumps([{k:run.get(k) for k in ['id','head_sha','status','conclusion','html_url']} for run in data.get('workflow_runs',[])]))
elif mode=='info':
 data=api('/pages');print(json.dumps({k:data.get(k) for k in ['status','html_url','build_type','source']}))
elif mode=='logs':
 data=api('/actions/runs/'+sys.argv[2]+'/jobs');print(json.dumps([{k:job.get(k) for k in ['id','name','conclusion','steps']} for job in data.get('jobs',[])]))
else:raise SystemExit('Choose info, configure, status or logs.')
