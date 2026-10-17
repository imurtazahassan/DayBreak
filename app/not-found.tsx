import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <p className="kicker text-terracotta">Error 404</p>
      <h1 className="mt-3 font-serif text-4xl text-ink">This page didn&apos;t make the edition</h1>
      <p className="mt-3 text-ink-soft">The story or page you were looking for doesn&apos;t exist in this demo.</p>
      <Link href="/" className="mt-6 inline-flex min-h-10 items-center bg-forest px-4 text-sm text-paper hover:bg-ink">
        Back to today&apos;s paper
      </Link>
    </div>
  )
}
