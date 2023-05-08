import { IsInt, IsNotEmpty, IsString, MaxLength} from "class-validator";

export class SearchDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(21)

  search: string;
}
