## Error Type

Runtime ReferenceError

## Error Message

useRelayIds is not defined

    at OrderDetailClient (src\components\collections\OrderDetailClient.tsx:78:30)
    at OrderDetailPage (src\app\(protected)\dashboard\orders\[id]\page.tsx:42:10)

## Code Frame

76 | export function OrderDetailClient({ orderId }: OrderDetailClientProps) {
77 | const { data: session } = useSession();

> 78 | const { decodeGlobalId } = useRelayIds();

     |                              ^

79 | const [counterOfferOpen, setCounterOfferOpen] = useState(false);
80 |
81 | const [{ data, fetching, error }, refetchOrder] = useQuery({

Next.js version: 15.5.6 (Webpack)
