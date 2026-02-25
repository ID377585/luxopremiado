-- Final fix: remove reserve_raffle_numbers int[] overload to avoid PGRST203 ambiguity
-- Keep only bigint[] signature and force PostgREST schema reload.

begin;

drop function if exists public.reserve_raffle_numbers(text, int[], int, int);

grant execute on function public.reserve_raffle_numbers(text, bigint[], int, int) to authenticated;

select pg_notify('pgrst', 'reload schema');

commit;
