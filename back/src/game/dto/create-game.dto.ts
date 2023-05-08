import { IsBoolean, IsNumber, IsOptional, IsUUID } from "class-validator";

export class CreateGameDto {
    @IsOptional()
    @IsUUID()
    game_id?: string;
    
    @IsUUID()
    playerone: string;
    
    @IsUUID()
    playertwo: string;
    
    @IsOptional()
    @IsUUID()
    winner?: string;
    
    @IsOptional()
    @IsNumber()
    playeroneScore?: number;
    
    @IsOptional()
    @IsNumber()
    playertwoScore?: number;
    
    @IsOptional()
    @IsBoolean()
    status?: boolean;
}
