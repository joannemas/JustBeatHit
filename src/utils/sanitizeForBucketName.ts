export function sanitizeForBucketName(input: string): string {
    return input
        .normalize('NFD')                     // décompose les accents
        .replace(/[\u0300-\u036f]/g, '')      // supprime les accents
        .replace(/['"]/g, '')                 // supprime apostrophes et guillemets
        .replace(/[^a-zA-Z0-9 -]/g, '')       // supprime autres caractères spéciaux
        .replace(/\s+/g, ' ')                 // espace unique
        .trim();
}