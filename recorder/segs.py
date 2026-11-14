# Motion-interpolated segments straight from the raw screencast timestamps, with the email blur baked in.
import subprocess, json
from concurrent.futures import ThreadPoolExecutor
MI = "fps=60,mpdecimate=hi=200:lo=50:frac=0.05:max=3,minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
# name, source, start, end, blur regions in source time [(x,y,w,h,t0,t1)]
H1 = (536,98,368,34); H2 = (536,113,368,31); M = (798,474,330,62)
segs = [
  ('p1','b-practice',0.8,7.8,[]), ('p2','b-practice',45.2,52.0,[]), ('p3','b-practice',70.0,74.6,[]), ('p5','b-practice',156.6,162.6,[]),
  ('c1','c-city',1.0,4.8,[]), ('c2','c-city',11.9,16.1,[]), ('c3','c-city',27.8,37.8,[]),
  ('c4','c-city',203.2,210.0,[]), ('c5','c-city',228.4,234.8,[]),
  ('c6','c-city',285.2,288.6,[]), ('c7','c-city',306.6,321.8,[]),
  ('tx','d-tx',0,8.0,[]), ('co','e-collect',61.2,69.6,[]), ('m1','f-money',0.0,3.8,[]), ('m2','f-money',36.8,43.2,[]), ('pr','g-proof',0,7.4,[]),
]
def run(s):
    name, src, a, b, regs = s
    vf = [MI]
    chain = f"[0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:0:0:color=0x07050f,setsar=1,{MI},tpad=stop_mode=clone:stop_duration=4,format=yuv420p[v0]"; cur = '[v0]'
    if regs:
        chain += f";{cur}split={len(regs)+1}[base]" + ''.join(f'[s{i}]' for i in range(len(regs))); cur = '[base]'
        for i,(x,y,w,h,t0,t1) in enumerate(regs):
            r0, r1 = t0 - a, t1 - a
            chain += f";[s{i}]crop={w}:{h}:{x}:{y},gblur=sigma=9[b{i}];{cur}[b{i}]overlay={x}:{y}:enable='between(t,{r0},{r1})'[o{i}]"; cur = f'[o{i}]'
    # exact window: the frame showing at `a` starts the list, trimmed to begin at a
    lines = open(f'frames/{src}/list.txt').read().split('\n')
    files = [l[6:-1] for l in lines if l.startswith('file')]; durs = [float(l.split()[1]) for l in lines if l.startswith('duration')]
    t = 0; out = []
    for fn, d in zip(files, durs):
        s0, s1 = t, t + d; t = s1
        if s1 <= a or s0 >= b: continue
        out.append(f"file '{fn}'"); out.append(f'duration {max(0.0167, min(s1, b) - max(s0, a)):.4f}')
    out.append(out[-2])
    lst = f'frames/{src}/seg-{name}.txt'; open(lst, 'w').write('\n'.join(out))
    subprocess.run(['ffmpeg','-loglevel','error','-y','-f','concat','-safe','0','-i',lst,'-filter_complex',chain,'-map',cur,'-t',f'{b-a:.3f}','-c:v','libx264','-crf','14','-preset','medium','-pix_fmt','yuv420p',f'clips/seg-{name}.mp4'],check=True)
    return name
import sys
only = sys.argv[1:]
with ThreadPoolExecutor(4) as ex:
    def safe(x):
        try: return run(x)
        except Exception as e: return f'FAIL {x[0]}'
    for n in ex.map(safe, [x for x in segs if not only or x[0] in only]): print('done', n, flush=True)
