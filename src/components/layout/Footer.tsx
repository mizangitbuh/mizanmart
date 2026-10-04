export function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between gap-4 text-sm text-gray-600 dark:text-gray-400">
        <div>© {new Date().getFullYear()} mizanmart. All rights reserved.</div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-blue-600">About</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
          <a href="#" className="hover:text-blue-600">Privacy</a>
        </div>
      </div>
    </footer>
  )
}
