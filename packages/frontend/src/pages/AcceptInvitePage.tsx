import AcceptInvitePanel from '../features/accept-invite/component/AcceptInvitePanel'

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Create your account</h1>
        <AcceptInvitePanel />
      </div>
    </div>
  )
}
