const ACCOUNT_LINKING_ERRORS = new Set([
	'account_not_linked',
	'unable_to_link_account',
	'account_already_linked_to_different_user'
]);

export function getOAuthErrorMessage(errorCode: string | null): string | null {
	if (!errorCode) return null;

	if (ACCOUNT_LINKING_ERRORS.has(errorCode.toLowerCase())) {
		return 'That Google account could not be linked. Sign in with email first, then try Google again.';
	}

	return 'Google sign-in failed. Try again.';
}
