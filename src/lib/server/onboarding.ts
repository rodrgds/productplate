interface OnboardingProfile {
	_id: unknown;
}

export function shouldRedirectToOnboarding(
	pathname: string,
	onboardingPath: string,
	profile: OnboardingProfile | null
) {
	return !profile && pathname !== onboardingPath;
}
