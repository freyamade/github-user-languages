"""Simple script to handle the versioning for me to ensure I don't miss a version"""

import json
import subprocess

# Get the version to bump
while True:
    bump_ver = input('[m]ajor / m[i]nor / [p]atch: ')
    if bump_ver in ['m', 'i', 'p']:
        break

# Open the manifest and package.json files and increment the version number, and also add a new header to the changelog
with open('package.json') as f:
    data = json.load(f)
old_ver = data['version']
old_ver_segments = [int(v) for v in old_ver.split('.')]

# Incrememnt the correct number for the version
if bump_ver == 'p':
    old_ver_segments[2] += 1
elif bump_ver == 'i':
    old_ver_segments[1] += 1
    old_ver_segments[2] = 0
elif bump_ver == 'm':
    old_ver_segments[0] += 1
    old_ver_segments[1] = 0
    old_ver_segments[2] = 0

new_ver = '.'.join(str(v) for v in old_ver_segments)
print(f'Bumping to v{new_ver}')
data['version'] = new_ver

with open('package.json', 'w') as f:
    json.dump(data, f, sort_keys=True, indent=2)

# Now the manifest files
with open('dist/manifest.json') as f:
    data = json.load(f)
data['version'] = new_ver
with open('dist/manifest.json', 'w') as f:
    json.dump(data, f, sort_keys=True, indent=2)

# Open the dist specific manifests
with open('dist/manifests/firefox.json') as f:
    data = json.load(f)
data['version'] = new_ver
with open('dist/manifest.json', 'w') as f:
    json.dump(data, f, sort_keys=True, indent=2)
with open('dist/manifests/chrome.json') as f:
    data = json.load(f)
data['version'] = new_ver
with open('dist/manifest.json', 'w') as f:
    json.dump(data, f, sort_keys=True, indent=2)

# Also append the new version to the start of the CHANGELOG
with open('CHANGELOG.md') as f:
    lines = f.readlines()
lines = [f'# {new_ver}', '\n', '\n'] + lines
with open('CHANGELOG.md', 'w') as f:
    f.write(''.join(lines))

# Also run sed on the popup.html file to change the version in the popup
cmd = ['sed', '-i', f's/v{old_ver}/v{new_ver}/', 'dist/popup.html']
subprocess.run(cmd)
