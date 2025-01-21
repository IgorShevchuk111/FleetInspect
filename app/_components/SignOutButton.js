import { signOutAction } from '@/app/_lib/actions.js';

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button>Sign out</button>
    </form>
  );
}

export default SignOutButton;
