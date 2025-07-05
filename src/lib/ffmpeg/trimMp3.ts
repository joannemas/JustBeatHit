// src/lib/ffmpeg/trimAudio.ts
export const trimMp3 = async (file: File, start: number, duration: number): Promise<Blob> => {
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();

    if (!ffmpeg.loaded) {
        await ffmpeg.load();
    }

    const inputName = 'input.mp3';
    const outputName = 'output.mp3';

    ffmpeg.writeFile(inputName, await fetchFile(file));

    await ffmpeg.exec([
        '-ss', `${start}`,
        '-t', `${duration}`,
        '-i', inputName,
        '-acodec', 'copy',
        outputName,
    ]);

    const data = await ffmpeg.readFile(outputName);
    return new Blob([data], { type: 'audio/mpeg' });
};
