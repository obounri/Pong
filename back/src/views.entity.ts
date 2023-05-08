import { ViewEntity, ViewColumn } from 'typeorm';

@ViewEntity({
  name: 'ReadUsersProfile',
  expression: `
    select users.*,
    COALESCE(( 
        select 
            array_to_json( array_agg ( 
                    json_build_object(
                        'id', "group"."id",
                        'isPasswordProtected', "group"."isPasswordProtected",
                        'name', "group"."name"
                    )
                )
            ) from "group" where exists ( select true from group_members gm where "group"."id" = gm.group_id and "gm"."member_id"::uuid = users.uuid::uuid and "gm".is_ban = false )
    ), '[]'::json) as "groups",
    COALESCE((
        select
            array_to_json( array_agg (
                json_build_object(
                    'id', "friend_user"."uuid",
                    'friend_id', "fr"."uuid",
                    'firstName', "friend_user"."firstName",
                    'lastName', "friend_user"."lastName",
                    'username', "friend_user"."username",
                    'avatarUrl', "friend_user"."avatarUrl",
                    'xp', "friend_user"."xp",
                    'status', "friend_user"."status",
                    'firstLogin', "friend_user"."firstLogin",
                    't_joined', "friend_user"."t_joined"
                )
            ))
        from
            "friends" "fr", "users" "friend_user"
        where 
            "fr"."status" = 'friend' and (("users"."uuid" = "fr"."user_id"::uuid and "friend_user"."uuid" = "fr"."friend_id"::uuid) OR 
            ("users"."uuid" = "fr"."friend_id"::uuid and "friend_user"."uuid" = "fr"."user_id"::uuid) )
    ), '[]'::json) as "friends"
    from users;
    `
})
export class ReadUsersProfileView {
  @ViewColumn()
  email: string;
  @ViewColumn()
  id: string;

  @ViewColumn()
  firstName: string;

  @ViewColumn()
  lastName: string;
  @ViewColumn()
  username: string;

  @ViewColumn()
  xp: string;

  @ViewColumn()
  status: string;

  @ViewColumn()
  avatarUrl: string;

  @ViewColumn()
  _2fa: string;

  @ViewColumn()
  _2faSecret: string;

  @ViewColumn()
  firstLogin: string;

  @ViewColumn()
  t_joined: string;

  @ViewColumn()
  groups: string;

  @ViewColumn()
  friends: string;
}
