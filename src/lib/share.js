export async function shareConfiguration(url) {
  if (navigator.share) {
    await navigator.share({
      title: 'Chair configuration',
      url
    });
    return;
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(url);
    return;
  }

  const helper = document.createElement('textarea');
  helper.value = url;
  helper.setAttribute('readonly', '');
  helper.style.position = 'absolute';
  helper.style.left = '-9999px';
  document.body.append(helper);
  helper.select();
  document.execCommand('copy');
  helper.remove();
}
