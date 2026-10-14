create table if not exists categories(id serial primary key, name text not null, slug text unique not null);
create table if not exists products(id serial primary key, name text not null, spec text default '', category_id int references categories(id) on delete cascade);
create table if not exists stores(id serial primary key, name text unique not null);
create table if not exists listings(
  id serial primary key,
  product_id int references products(id) on delete cascade,
  store_id int references stores(id) on delete cascade,
  url text, selector text, price int,
  warranty text default '1 year', official boolean default true,
  updated_at timestamptz default now(), last_error text);
create table if not exists price_history(id serial primary key, listing_id int references listings(id) on delete cascade, price int not null, at timestamptz default now());
