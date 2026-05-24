import { useAuthStore } from '@/store/authStore'
import { DragDropUploader } from '@/components/crypto/DragDropUploader'
import { FileList } from '@/components/drive/FileList'
import { Button } from '@/components/ui/button'
import { Shield, SignOut } from '@phosphor-icons/react'
import { Toaster } from 'sonner'

export const Dashboard = () => {
  const { userProfile, logout } = useAuthStore()

  return (
    <div className="min-h-screen bg-(--background) text-(--foreground) antialiased">
      <Toaster position="bottom-right" richColors />
      
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-(--border) bg-(--background)/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="CipherDrive Logo" className="h-8 w-auto object-contain" />
            <span className="font-mono text-base font-semibold tracking-tight text-white">
              Cipher<span className="text-emerald-400">Drive</span>
            </span>
          </div>
          
          {userProfile && (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-medium leading-none">{userProfile.name}</span>
                  <span className="text-xs text-(--muted-foreground)">{userProfile.email}</span>
                </div>
                {userProfile.picture ? (
                  <img src={userProfile.picture} alt={userProfile.name} referrerPolicy="no-referrer" className="h-8 w-8 rounded-full bg-(--muted)" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-(--primary)/20 flex items-center justify-center font-bold text-xs">
                    {userProfile.name.charAt(0)}
                  </div>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={logout} className="text-(--muted-foreground) hover:text-(--foreground)">
                <SignOut weight="duotone" className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="space-y-8">
          {/* Temporary Welcome Header */}
          <div className="bg-(--card) border border-(--border) rounded-xl p-6 shadow-sm flex items-center gap-4">
             {userProfile?.picture && (
               <img src={userProfile.picture} alt={userProfile.name} referrerPolicy="no-referrer" className="h-12 w-12 rounded-full border border-(--border)" />
             )}
             <div>
               <h2 className="text-lg font-semibold">Welcome back, {userProfile?.name}!</h2>
               <p className="text-sm text-(--muted-foreground)">You are securely authenticated with Google Drive.</p>
             </div>
          </div>

          {/* Hero section */}
          <div className="text-center space-y-2 pt-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-(--primary)/10 px-4 py-1.5 text-sm text-(--primary)">
              <Shield weight="duotone" className="h-4 w-4" />
              Zero-Knowledge Encryption
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Secure File Vault
            </h1>
            <p className="text-(--muted-foreground) max-w-lg mx-auto">
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
