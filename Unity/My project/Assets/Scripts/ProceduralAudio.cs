using UnityEngine;

// Small helper for generating placeholder audio entirely in code - no
// downloads, no external tools. Meant to fill the "완전 무음" gap until
// real composed music/SFX exists, not to be the final audio.
public static class ProceduralAudio
{
    const int SampleRate = 44100;

    // A soft ambient pad: a few slightly-detuned sine waves plus a slow
    // volume LFO, so it doesn't feel like a dead test tone. Loops seamlessly
    // because the duration is an exact multiple of every wave's period.
    public static AudioClip CreateAmbientDrone(string name, float baseFrequency, float duration = 4f, float volume = 0.06f)
    {
        int sampleCount = Mathf.RoundToInt(SampleRate * duration);
        var samples = new float[sampleCount];

        float[] partials = { 1f, 1.5f, 2.003f }; // root + fifth + slightly-detuned octave
        float[] partialGains = { 0.6f, 0.25f, 0.15f };

        for (int i = 0; i < sampleCount; i++)
        {
            float t = (float)i / SampleRate;
            float sample = 0f;
            for (int p = 0; p < partials.Length; p++)
            {
                sample += partialGains[p] * Mathf.Sin(2f * Mathf.PI * baseFrequency * partials[p] * t);
            }

            float lfo = 0.85f + 0.15f * Mathf.Sin(2f * Mathf.PI * 0.1f * t); // slow breathing
            samples[i] = sample * volume * lfo;
        }

        var clip = AudioClip.Create(name, sampleCount, 1, SampleRate, false);
        clip.SetData(samples, 0);
        return clip;
    }

    // Short UI blip with a fast attack/decay envelope so it doesn't click/pop.
    public static AudioClip CreateUiBlip(string name, float frequency = 880f, float duration = 0.07f, float volume = 0.18f)
    {
        int sampleCount = Mathf.RoundToInt(SampleRate * duration);
        var samples = new float[sampleCount];

        for (int i = 0; i < sampleCount; i++)
        {
            float t = (float)i / SampleRate;
            float envelope = Mathf.Sin(Mathf.PI * i / sampleCount); // 0 -> 1 -> 0, no clicks at edges
            samples[i] = Mathf.Sin(2f * Mathf.PI * frequency * t) * volume * envelope;
        }

        var clip = AudioClip.Create(name, sampleCount, 1, SampleRate, false);
        clip.SetData(samples, 0);
        return clip;
    }
}
