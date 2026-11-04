const GITHUB_USER = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Returns a GitHub profile URL for a username, allowing a leading @. Invalid or empty names have no link. */
export function githubProfile(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const username = value.trim().replace(/^@/, '');
	return GITHUB_USER.test(username) ? `https://github.com/${username}` : undefined;
}
