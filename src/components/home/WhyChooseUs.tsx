import {
  Truck,
  Shield,
  CreditCard,
  Headphones,
  Award,
  Clock,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free delivery on orders above Rs. 500",
  },
  {
    icon: Shield,
    title: "Genuine Products",
    description: "100% authentic medicines & healthcare",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    description: "Safe & encrypted payment methods",
  },
  {
    icon: Clock,
    title: "Fast Delivery",
    description: "Quick doorstep delivery within 2-3 days",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round the clock customer assistance",
  },
  {
    icon: Award,
    title: "Quality Assured",
    description: "Licensed pharmacy with certified products",
  },
];

export default function WhyChooseUs() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="page-wrapper">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Why Choose Daily Dose?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your health is our priority. We provide genuine medicines and
            healthcare products with the best service in the industry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 hover:border-red-600 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="bg-red-100 p-3 rounded-lg group-hover:bg-red-600 transition-colors">
                    <Icon className="h-6 w-6 text-red-600 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
