import {execFileSync} from 'node:child_process';
execFileSync(process.platform==='win32'?'py':'python3',['scripts/package_handoff.py'],{stdio:'inherit'});
