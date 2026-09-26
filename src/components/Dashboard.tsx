import { useAuthStore } from '@/store/authStore'
import { DragDropUploader } from '@/components/crypto/DragDropUploader'
import { FileList } from '@/components/drive/FileList'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Shield, SignOut } from '@phosphor-icons/react'

export const Dashboard = () => {
  const { userProfile, logout } = useAuthStore()

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="" className="h-7 w-auto object-contain" />
            <span className="text-base font-semibold tracking-tight text-foreground">
              Cipher<span className="text-primary">Drive</span>
            </span>
          </div>

          {userProfile && (
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden items-center gap-2.5 sm:flex">
                <div className="flex flex-col items-end leading-tight">
                  <span className="text-sm font-medium">{userProfile.name}</span>
                  <span className="text-xs text-muted-foreground">{userProfile.email}</span>
                </div>
                {userProfile.picture ? (
                  <img
                    src={userProfile.picture}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full bg-muted"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground hover:text-foreground">
                <SignOut weight="regular" className="h-4 w-4" aria-hidden="true" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
            {userProfile?.picture && (
              <img
                src={userProfile.picture}
                alt=""
                referrerPolicy="no-referrer"
                className="h-12 w-12 rounded-full border border-border"
              />
            )}
            <div>
              <h2 className="text-lg font-semibold text-foreground">Welcome back, {userProfile?.name}!</h2>
              <p className="text-sm text-muted-foreground">You are securely authenticated with Google Drive.</p>
            </div>
          </div>

          <div className="space-y-2 pt-2 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm text-primary">
              <Shield weight="regular" className="h-4 w-4" aria-hidden="true" />
              Zero-Knowledge Encryption
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Secure File Vault
            </h1>
            <p className="mx-auto max-w-lg text-muted-foreground">
              Encrypt files locally with your password before uploading to
              Google Drive. Your key, your data.
            </p>
          </div>

          <DragDropUploader />
          <FileList />
        </div>
      </main>
    </div>
  )
}
