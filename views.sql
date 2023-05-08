CREATE or replace VIEW ReadUsersProfile AS
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
    ) from "users_groups_group"
    join "group" on ("users_groups_group"."groupId" = "group"."id")
    where "users_groups_group"."usersId" = "users"."id"
), '[]'::json) as "groups",
COALESCE((
    select
        array_to_json( array_agg (
            json_build_object(
                'id', "friend_user"."id",
                'firstName', "friend_user"."firstName",
                'lastName', "friend_user"."lastName",
                'username', "friend_user"."username",
                'avatarUrl', "friend_user"."avatarUrl",
                'gamesCount', "friend_user"."gamesCount",
                'wins', "friend_user"."wins",
                'score', "friend_user"."score",
                'status', "friend_user"."status",
                'firstLogin', "friend_user"."firstLogin",
                't_joined', "friend_user"."t_joined"
            )
        ))
    from
        "friends", "users" "friend_user"
    where
        "users"."id" = "friends"."user_id" and "friend_user"."id" = "friends"."friend_id"
), '[]'::json) as "friends"
from users;

DROP FUNCTION readuserprofile(integer, integer);
create or replace function ReadUserProfile(session_user_id int, user_id int) 
	returns table (
        id int,
        "firstName" varchar,
        "lastName" varchar,
        username varchar,
        avatarUrl varchar,
        "gamesCount" int,
        wins int,
        score int,
        status users_status_enum,
        "firstLogin" boolean,
        t_joined timestamp,
        "friendship" text
	)
as $$
begin
	return query 
		select 
            users.id,
            users."firstName",
            users."lastName",
            users.username,
            users.avatarUrl,
            users."gamesCount",
            users.wins,
            users.score,
            users.status,
            users."firstLogin",
            users.t_joined,
            ( CASE 
            WHEN (select true from friends where friends.user_id = session_user_id and friends.friend_id = users.id and friends.blocked = false) = true THEN 'friend' 
            WHEN (select true from friends where friends.user_id = session_user_id and friends.friend_id = users.id) = true THEN 'blocked'
            WHEN (select true from friendships where friendships.sender_id = session_user_id and friendships.receiver_id = user_id) = true then 'pending_invite_sent'
            WHEN (select true from friendships where friendships.sender_id = user_id and friendships.receiver_id = session_user_id) = true then 'pending_invite_received'
            ELSE 'not_friend'
            END
            ) as "friendship"
        from users where users.id = user_id and not exists ( select true from friends where friends.user_id = users.id and friends.friend_id = session_user_id and friends.blocked = true ) ;--check if the other user block this user;
end;$$

LANGUAGE 'plpgsql';

-- and not ( [...] )