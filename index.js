const { writeFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');

module.exports = {
  init(api) {
    // In-memory buffer: cwd → { sessions: Map<sessionId, { name, lines[] }> }
    const projects = new Map();

    // Load existing KB file content on first encounter of a cwd
    function ensureProject(cwd) {
      if (projects.has(cwd)) return projects.get(cwd);
      const proj = { sessions: new Map() };
      // Parse existing file to preserve previous entries
      const filename = api.getSetting('filename') || 'project-kb.md';
      const filepath = join(cwd, filename);
      if (existsSync(filepath)) {
        try {
          const content = readFileSync(filepath, 'utf8');
          let currentSession = null;
          for (const line of content.split('\n')) {
            if (line.startsWith('# ')) {
              currentSession = line.slice(2).trim();
              if (!proj.sessions.has(currentSession)) {
                proj.sessions.set(currentSession, { name: currentSession, lines: [] });
              }
            } else if (line.startsWith('- ') && currentSession) {
              proj.sessions.get(currentSession).lines.push(line.slice(2));
            }
          }
        } catch {}
      }
      projects.set(cwd, proj);
      return proj;
    }

    function flush(cwd) {
      if (!api.getSetting('enabled')) return;
      const proj = projects.get(cwd);
      if (!proj) return;

      const filename = api.getSetting('filename') || 'project-kb.md';
      const filepath = join(cwd, filename);

      let md = '';
      for (const [, session] of proj.sessions) {
        if (!session.lines.length) continue;
        md += `# ${session.name}\n\n`;
        for (const line of session.lines) {
          md += `- ${line}\n`;
        }
        md += '\n';
      }

      if (!md) return;
      try {
        writeFileSync(filepath, md.trimEnd() + '\n');
      } catch (e) {
        api.log(`write failed (${filepath}): ${e.message}`);
      }
    }

    api.onTranscriptEntry((sessionId, role, text) => {
      if (role !== 'user') return;
      if (!api.getSetting('enabled')) return;
      if (!text.trim()) return;

      const session = api.getSession(sessionId);
      if (!session) return;

      const cwd = session.cwd;
      if (!cwd) return;

      const proj = ensureProject(cwd);
      const key = sessionId;

      if (!proj.sessions.has(key)) {
        proj.sessions.set(key, { name: session.name, lines: [] });
      }
      const entry = proj.sessions.get(key);
      // Update name in case it was renamed
      entry.name = session.name;
      entry.lines.push(text.trim());

      flush(cwd);
    });

    api.onShutdown(() => {
      for (const [cwd] of projects) flush(cwd);
    });
  }
};
