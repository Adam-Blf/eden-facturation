-- Bucket public : pas besoin de policy SELECT (URL publique suffit), evite le listing
drop policy if exists "branding public read" on storage.objects;

-- handle_new_user est un trigger : ne doit pas etre appelable via l'API REST
revoke all on function public.handle_new_user() from anon, authenticated, public;
