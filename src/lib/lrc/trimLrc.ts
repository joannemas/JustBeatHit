export const trimLrc = async (file: File, start: number, end: number): Promise<Blob> => {
    const text = await file.text();
    const lines = text.split('\n');

    const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{2,3}))?\]/;

    const filteredLines = lines.filter((line) => {
        const match = line.match(timeRegex);
        if (!match) return false;
        const min = parseInt(match[1], 10);
        const sec = parseInt(match[2], 10);
        const ms = match[3] ? parseInt(match[3], 10) : 0;
        const timeInSec = min * 60 + sec + ms / 1000;
        return timeInSec >= start && timeInSec <= end;
    });

    const adjustedLines = filteredLines.map((line) => {
        return line.replace(timeRegex, (match, m, s, ms = '00') => {
            const originalTime =
                parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
            const newTime = originalTime - start;

            const minutes = Math.floor(newTime / 60)
                .toString()
                .padStart(2, '0');
            const seconds = Math.floor(newTime % 60)
                .toString()
                .padStart(2, '0');
            const milliseconds = Math.round(
                (newTime - Math.floor(newTime)) * 100
            )
                .toString()
                .padStart(2, '0');

            return `[${minutes}:${seconds}.${milliseconds}]`;
        });
    });

    return new Blob([adjustedLines.join('\n')], { type: 'text/plain' });
};