
import os 
import json

all_files = os.listdir('./data/locales/')

def clean_line(s: str) -> str :
    return s.replace('=', '').replace('[', '').replace(']', '').strip()


all_maps = {}
for file in all_files:
    with open('./data/locales/' + file, 'r') as reader: 
        local_type = reader.name.split('/')[-1].split('.')[0]
        generation = ''
        for line in  reader.readlines():
            if '=== [[' in line: 
                map_name = clean_line(line)
                if map_name in all_maps.keys():
                    all_maps[map_name]['type'].append(local_type)
                else :
                    all_maps[map_name] = {
                        'name' : map_name,
                        'generation': generation,
                        'type': [local_type]
                    }
            elif "== [[" in line: 
                generation = clean_line(line)


with open('./locales.json', 'w') as writer:
    json.dump(list(all_maps.values()), writer)

print(f'saved {len(list(all_maps.values()))} items')