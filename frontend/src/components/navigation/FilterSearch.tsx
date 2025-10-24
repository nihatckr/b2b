import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FilterSearchProps {
  cardTitle: string;
  search: string;
  allStatuses: string;
  pendingStatuses: string;
  reviewedStatuses: string;
  quoteSentStatuses: string;
  confirmedStatuses: string;
  inProductionStatuses: string;
  shippedStatuses: string;
  deliveredStatuses: string;
  setStatusFilter: (value: string) => void;
  statusFilter: string;
  setSearch: (value: string) => void;
}

const FilterSearch = ({
  cardTitle,
  allStatuses,
  pendingStatuses,
  reviewedStatuses,
  quoteSentStatuses,
  confirmedStatuses,
  inProductionStatuses,
  shippedStatuses,
  deliveredStatuses,
  setStatusFilter,
  statusFilter,
  setSearch,
  search,
}: FilterSearchProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Sipariş no, koleksiyon ara..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Durum filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL"> {allStatuses} </SelectItem>
              <SelectItem value="PENDING"> {pendingStatuses} </SelectItem>
              <SelectItem value="REVIEWED"> {reviewedStatuses} </SelectItem>
              <SelectItem value="QUOTE_SENT"> {quoteSentStatuses} </SelectItem>
              <SelectItem value="CONFIRMED"> {confirmedStatuses} </SelectItem>
              <SelectItem value="IN_PRODUCTION">
                {inProductionStatuses}{" "}
              </SelectItem>
              <SelectItem value="SHIPPED"> {shippedStatuses} </SelectItem>
              <SelectItem value="DELIVERED"> {deliveredStatuses} </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterSearch;
