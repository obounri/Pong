import { User } from "src/user/entities/user.entity";
import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "challenges"})
export class Challenge {
    @PrimaryGeneratedColumn("uuid")
    id: string;
}