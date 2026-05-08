'use client';

import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { mockVideoJobs } from '@/lib/mock-data';
import { generateVideo } from '@/lib/api/video';

export function CreateWorkspace() {
  const [prompt, setPrompt] = useState('Create a 12-second cinematic market recap with neon charts and futuristic overlays.');
  const [duration, setDuration] = useState('12');
  const [style, setStyle] = useState('cinematic');
  const [resolution, setResolution] = useState('1080p');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function onGenerate() {
    setLoading(true);
    try {
      const job = await generateVideo({ prompt, duration: Number(duration), style, resolution });
      setVideoUrl(job.video_url || '');
    } catch {
      setVideoUrl('https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6">
        <Card>
          <h3 className="font-semibold">Prompt</h3>
          <Input className="mt-4" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <Input value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Duration" />
            <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="Style" />
            <Input value={resolution} onChange={(e) => setResolution(e.target.value)} placeholder="Resolution" />
          </div>
          <Button className="mt-4" onClick={onGenerate}>{loading ? 'Generating...' : 'Generate video'}</Button>
        </Card>

        <Card>
          <h3 className="font-semibold">Player</h3>
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-black/20">
            {videoUrl ? (
              <video className="w-full" controls src={videoUrl} />
            ) : (
              <div className="flex h-[360px] items-center justify-center text-sm text-muted">Rendered video will appear here.</div>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold">Recent jobs</h3>
        <div className="mt-4 space-y-3">
          {mockVideoJobs.map((job) => (
            <div key={job.job_id} className="rounded-xl border border-border bg-black/20 p-3 text-sm">
              <p className="font-medium">{job.prompt}</p>
              <p className="mt-1 text-muted">{job.job_id} · {job.status}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
