import proc from 'child_process';

const state = (global.ROLLUP_SERVER = global.ROLLUP_SERVER || {
  server: undefined,
});

export default function serve() {
  function toExit() {
    if (state.server) state.server.kill(0);
  }

  return {
    writeBundle() {
      if (state.server) return;
      state.server = proc.spawn(
        'npm',
        ['run', 'start', '--', '--dev'],
        {
          stdio: ['ignore', 'inherit', 'inherit'],
          shell: true,
        },
      );

      process.on('SIGTERM', toExit);
      process.on('exit', toExit);
    },
  };
}
