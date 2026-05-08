import Link from 'next/link';
import type { Route } from 'next';
import { Card } from '@/components/common/Card';
import { mockProjects } from '@/lib/mock-data';

const targetByType: Record<string, Route> = {
  website: '/build',
  app: '/build',
  video: '/create',
  trading: '/trade',
  workflow: '/automate'
};

export function ProjectsTable() {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="pb-3 font-medium">Name</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Last updated</th>
              <th className="pb-3 font-medium">Open</th>
            </tr>
          </thead>
          <tbody>
            {mockProjects.map((project) => (
              <tr key={project.id} className="border-t border-border">
                <td className="py-4">{project.name}</td>
                <td className="py-4 capitalize text-muted">{project.type}</td>
                <td className="py-4 text-muted">{project.updated_at}</td>
                <td className="py-4">
                  <Link href={targetByType[project.type]} className="text-accent hover:underline">Open project</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
