export interface Product {
    id?: string;
    name: string;
    description: string;
    image_url: string;
    home_url: string;
    type: string;
    category: string;
}

export interface Plan {
    id?: string;
    product_id?: string;
    name: string;
    description: string;
    status?: "CREATED" | "ACTIVE" | "INACTIVE";
    quantity_supported?: boolean;
    billing_cycles: {
        frequency: {
            interval_unit: "MONTH";
            interval_count: number;
        };
        tenure_type: "TRIAL" | "REGULAR";
        sequence: number;
        total_cycles: number;
        pricing_scheme?:
            | {
                  fixed_price: {
                      value: string;
                      currency_code: string;
                  };
              }
            | {
                  pricing_model: "VOLUME" | "TIERED";
                  tiers: {
                      amount: {
                          value: string;
                          currency_code: string;
                      };
                      starting_quantity: string;
                      ending_quantity?: string;
                  }[];
              };
    }[];
    payment_preferences:
        | {
              auto_bill_outstanding: boolean;
              payment_failure_threshhold: number;
          }
        | {
              auto_bill_outstanding: boolean;
              payment_failure_threshhold: number;
              setup_fee: {
                  value: string;
                  currency_code: string;
              };
              setup_fee_failure_action: "CONTINUE" | "CANCEL";
          };
    taxes?: {
        percentage: string;
        inclusive: boolean;
    };
}

export interface Subscription {
    billing_info: {
        cycle_executions: {
            tenure_type: "TRIAL" | "REGULAR";
            sequence: number;
            cycles_completed: number;
            cycles_remaining: number;
            total_cycles: number;
            current_pricing_scheme_version?: number;
        }[];
        final_payment_time: string;
        next_billing_time: string;
        outstanding_balance: { currency_code: string; value: string };
    };
    create_time: string;
    custom_id: string;
    id: string;
    links: { href: string; rel: string; method: string }[];
    plan_id: string;
    plan_overriden: boolean;
    quantity: string;
    shipping_amount: { currency_code: string; value: string };
    start_time: string;
    status: "CREATED" | "ACTIVE" | "INACTIVE";
    status_update_time: string;
    subscriber: {
        email_address: string;
        name: { given_name: string; surname: string };
        payer_id: string;
        shipping_address: {
            address: {
                address_line_1: string;
                address_line_2?: string;
                admin_area_1: string;
                admin_area_2: string;
                country_code: string;
                postal_code: string;
            };
        };
    };
    update_time: string;
}
