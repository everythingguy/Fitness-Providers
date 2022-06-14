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
