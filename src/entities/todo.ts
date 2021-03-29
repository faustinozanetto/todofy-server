import { Field, Int, ObjectType } from 'type-graphql';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user';

@ObjectType()
@Entity({ name: 'todos' })
export class Todo extends BaseEntity {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ nullable: false })
  title!: string;

  @Field()
  @Column({ nullable: false })
  description!: string;

  @Field()
  @Column({ nullable: false })
  completed!: boolean;

  @Field(() => Int)
  @Column()
  creatorId: number;

  @Field()
  @ManyToOne(() => User, (user) => user.todos)
  creator: User;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
