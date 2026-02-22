import { OrgNameChecker } from '../OrgNameChecker';

export default function App() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
            NPM Organization Name Checker
          </h1>
          <p className="mt-2 text-gray-600">
            Check the availability of npm organization names in real-time
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <OrgNameChecker autoFocus />
        </div>

        <div className="text-center text-sm text-gray-500">
          <p>
            Enter an organization name to check if it's available as an npm
            scope
          </p>
          <p className="mt-1">
            Names must be 1-214 characters, lowercase, and can contain hyphens
          </p>
        </div>
      </div>
    </main>
  );
}
