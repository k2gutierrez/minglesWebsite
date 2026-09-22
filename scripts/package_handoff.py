# -*- coding: utf-8 -*-
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import json, hashlib
root = Path(__file__).resolve().parents[1]
output = root / 'output'
output.mkdir(exist_ok=True)
target = output / 'Mingles-NextJS-Web3-Handoff.zip'
folders = ['src', 'public', 'docs', 'supabase', 'scripts', 'tests', '.vscode']
files = ['README.md', 'EMPIEZA_AQUI.md', 'package.json', 'package-lock.json', 'tsconfig.json', 'next-env.d.ts', 'next.config.ts', '.gitignore', '.env.example', 'AGENTS.md']
manifest=[]
with ZipFile(target,'w',ZIP_DEFLATED) as archive:
    for folder in folders:
        for path in sorted((root/folder).rglob('*')):
            if not path.is_file() or path.is_symlink() or '__pycache__' in path.parts: continue
            relative=path.relative_to(root).as_posix()
            archive.write(path,'Mingles-Website/'+relative)
            manifest.append(relative)
    for name in files:
        path=root/name
        if path.is_file(): archive.write(path,'Mingles-Website/'+name); manifest.append(name)
    for path in sorted(root.glob('*.pdf')):
        relative='reference-briefs/'+path.name
        archive.write(path,'Mingles-Website/'+relative); manifest.append(relative)
    archive.writestr('Mingles-Website/HANDOFF-MANIFEST.json',json.dumps({'files':manifest,'secrets_included':False},indent=2))
with ZipFile(target) as archive:
    assert archive.testzip() is None
    assert not any('/node_modules/' in x or '/.next/' in x or x.endswith('/.env.local') for x in archive.namelist())
print(str(target))
print(str(len(manifest))+' files; '+str(target.stat().st_size)+' bytes')
print('SHA256 '+hashlib.sha256(target.read_bytes()).hexdigest())
