import { useAcceptInvite } from '../hooks/useAcceptInvite'
import InviteStatusMessage from './InviteStatusMessage'
import AcceptInviteForm from './AcceptInviteForm'

export default function AcceptInvitePanel() {
  const {
    stage,
    preview,
    invalidMsg,
    fullName,
    setFullName,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    formError,
    handleSubmit,
  } = useAcceptInvite()

  return (
    <>
      {(stage === 'loading' || stage === 'invalid') && (
        <InviteStatusMessage stage={stage} invalidMsg={invalidMsg} />
      )}

      {(stage === 'form' || stage === 'submitting') && preview && (
        <AcceptInviteForm
          email={preview.email}
          fullName={fullName}
          setFullName={setFullName}
          password={password}
          setPassword={setPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          formError={formError}
          submitting={stage === 'submitting'}
          onSubmit={handleSubmit}
        />
      )}
    </>
  )
}
