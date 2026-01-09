import Header from "@/components/Header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

function Page() {
  return (
    <div className="container py-8 px-2 md:pl-10 md:ml-14">
      <Header hidden={false} />
      <h1 className="text-3xl font-bold mb-6">Privacy & Legal</h1>
      <Card>
        <CardHeader className="sm:px-6 px-2">
          <CardTitle>Privacy & Legal</CardTitle>
          <CardDescription>Review our policies and terms</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:ps-6 px-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">Privacy Policy</h3>
            <p className="text-sm text-gray-600 mb-2">
              We are committed to protecting your privacy. This policy explains
              how we collect, use, and safeguard your information.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>We collect information you provide directly to us</li>
              <li>Data is not encrypted and stored securely</li>
              <li>
                We never share your data with third parties without consent
              </li>
              <li>You can request data deletion at any time</li>
            </ul>
          </div>
          <div className="border-t pt-4">
            <h3 className="font-semibold text-lg mb-2">Terms and Conditions</h3>
            <p className="text-sm text-gray-600 mb-2">
              By using our service, you agree to the following terms.
            </p>
            <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
              <li>You agree to use the service lawfully</li>
              <li>You are responsible for account security</li>
              <li>We reserve the right to modify or terminate service</li>
              <li>Violations may result in account suspension</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Page;
