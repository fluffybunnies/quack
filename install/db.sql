
create table if not exists settings (
	id int unsigned auto_increment not null
	,name varchar(191) not null
	,value varchar(191) default null
	,created int not null
	,updated int not null

	,primary key (id)
	,unique key pk (name)
	,index created_ (created)
	,index updated_ (updated)
) engine=innodb charset=utf8mb4 collate=utf8mb4_unicode_ci;
