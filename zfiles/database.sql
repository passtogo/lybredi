/* Will allow the database to recognize the function uuid_generate_v4() */
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE TABLE IF NOT EXISTS public.users (
  id serial,
  uuid uuid DEFAULT uuid_generate_v4 () primary key NOT NULL,
  first varchar(70) NOT NULL,
  last varchar(70) NOT NULL,
  username varchar(150) NOT NULL,
  password varchar(255) NOT NULL,
  email varchar(255) UNIQUE NOT NULL,
  phone varchar(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS public.posts (
  id serial primary key,
  uuid uuid DEFAULT uuid_generate_v4 () NOT NULL,
  user_id uuid NOT NULL,
  category varchar(25) not null,
  title varchar(255) not null,
  body text NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(uuid) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.feedback (
  id serial primary key,
  first varchar(70) NOT NULL,
  last varchar(70) NOT NULL,
  happy BOOLEAN NOT NULL,
  rating smallint NOT NULL DEFAULT 0,
  description text NOT NULL DEFAULT 'Not Provided'
);
CREATE TABLE IF NOT EXISTS public.contacts (
  id serial primary key,
  First varchar(70) not null,
  Last varchar(70) not null,
  email varchar(255) not null, 
  phone varchar(20) not null,
  message text not null
);
-- CREATE TABLE IF NOT EXISTS public.postlikes (
--   id serial primary key,
--   post_id int NOT NULL,
--   uuid uuid NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE
-- );
-- CREATE TABLE IF NOT EXISTS public.comments (
-- 	id serial,
-- 	uuid uuid primary key DEFAULT uuid_generate_v4 () NOT NULL,
-- 	post_id int not null,
-- 	user_id int not null,
-- 	body varchar(255) not null,
-- 	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );
-- CREATE TABLE IF NOT EXISTS public.commentlikes (
--   id serial primary key,
--   comment_id int not null,
--   user_id int not null,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null
-- );
-- CREATE TABLE IF NOT EXISTS public.friends (
--   id serial primary key,
--   user_id int not null,
--   friend_id int not null,
--   accepted boolean DEFAULT false not null,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP not null,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   FOREIGN KEY (friend_id) REFERENCES users(id) ON DELETE CASCADE
-- );
-- CREATE TABLE IF NOT EXISTS public.chat (
--   userid uuid not null,
--   socket varchar(255)
-- );
-- CREATE TABLE IF NOT EXISTS public.room (
--   userid uuid not null,
--   room varchar(255) not null
-- );
-- CREATE TABLE IF NOT EXISTS public.messages (
--   id serial primary key,
--   sender int not null,
--   receiver int not null,
--   body varchar(255) not null,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   FOREIGN KEY (sender) REFERENCES users(id) on delete cascade,
--   FOREIGN KEY (receiver) REFERENCES users(id) on delete cascade
--  );
-- CREATE TABLE IF NOT EXISTS public.likemsg (
--   msg_id int not null,
--   user_id int not null,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
--   FOREIGN KEY (msg_id) REFERENCES messages(id) ON DELETE CASCADE
-- );