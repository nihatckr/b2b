interface TitleHeaderProps {
  isBuyer: boolean;
  titleHeader?: string;
  titleReverseHeader?: string;
  descriptionHeader?: string;
  descriptionReverseHeader?: string;
  icon?: React.ReactNode;
}

const TitleHeader = ({
  isBuyer,
  titleHeader,
  titleReverseHeader,
  descriptionHeader,
  descriptionReverseHeader,
  icon,
}: TitleHeaderProps) => {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold  ">
            {icon} {isBuyer ? titleHeader : titleReverseHeader}
          </h1>
          <p className=" ">
            {isBuyer ? descriptionHeader : descriptionReverseHeader}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TitleHeader;
