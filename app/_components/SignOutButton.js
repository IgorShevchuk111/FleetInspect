import { signOutAction } from '../_lib/actions';

function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button>Sign out</button>
    </form>
  );
}

export default SignOutButton;
