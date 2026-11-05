-- The pass no longer needs a pasted link.
--
-- The player picks one of the three cards and the site opens X with the text
-- ready. There is no post read API, so we cannot confirm the post existed; the
-- rule is that the post has to be public at review time or the candidate is not
-- eligible. Storing the card and the time is enough for that manual check.
--
-- post_url stays for the cases where someone does paste a link.

begin;

alter table public.mw_passes alter column post_url drop not null;

alter table public.mw_passes
    add column if not exists card text check (card in ('a', 'b', 'c'));

comment on column public.mw_passes.card is 'Which share card the player chose. The text is a bluff, not a position.';

commit;
