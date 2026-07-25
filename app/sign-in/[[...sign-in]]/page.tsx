import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your FormFixer account.',
};

export default function SignInPage() {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const hasValidClerkKey = Boolean(
    publishableKey &&
    publishableKey.startsWith('pk_') &&
    !publishableKey.includes('YOUR_PUBLISHABLE_KEY')
  );

  return (
    <main className="min-h-[calc(100vh-160px)] flex flex-col items-center justify-center py-12 px-4 bg-[var(--cream)]">
      <div className="w-full max-w-md flex justify-center">
        {hasValidClerkKey ? (
          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full flex justify-center',
                card: 'w-full shadow-md border border-[#e2ded6] rounded-2xl bg-white p-6',
              },
            }}
          />
        ) : (
          <div className="w-full shadow-md border border-[#e2ded6] rounded-2xl bg-white p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-xl font-bold">
              🔑
            </div>
            <h2 className="text-xl font-bold text-[#1c2826]">Clerk API Keys Required</h2>
            <p className="text-sm text-[#62706d] leading-relaxed">
              To enable sign-in, replace the placeholder key in your <code>.env.local</code> file with your actual publishable key from your Clerk dashboard:
            </p>
            <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#e2ded6] text-xs font-mono text-left text-[#1c2826] overflow-x-auto">
              NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
