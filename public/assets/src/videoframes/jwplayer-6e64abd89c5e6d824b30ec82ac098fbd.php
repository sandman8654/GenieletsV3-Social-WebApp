<?php
ini_set('display_errors', 1);
ini_set('log_errors', 0);

$videos = json_decode(rawurldecode($_GET['msvideos']), true);
$cover = @$_GET['mscover'];
$jsfile = "http://jwpsrv.com/library/J1hI9n9qEeKVkCIACp8kUw.js"; // jwplayer.js file URL.
$key = ""; // A key is not required to use the Free edition, but will still be available from your JW Player Account (https://account.longtailvideo.com/). Including your key will enable the free JW Player Analytics (http://www.longtailvideo.com/support/jw-player/28852/using-jw-player-analytics) for your account.
?>
<!DOCTYPE html>
<html lang="en-us">
	<head>
		<script src="<?php echo $jsfile; ?>"></script>
		<style>
			html, body {
				padding: 0;
				margin: 0;
				overflow: hidden;
			}
			
			#video {
				position: absolute;
				top: 0;
				left: 0;
				width: 100% !important;
				height: 100% !important;
			}
		</style>
	</head>
	<body>
<?php
	$videoFile = "";
	foreach($videos as $video) {
		if ($video['type'] == 'video/mp4') {
			$videoFile = $video['src'];
			break;
		}
		elseif ($video['type'] == 'video/webm') {
			$videoFile = $video['src'];
			break;
		}
	}
?>
		<div id="video"></div>
		<script>
			jwplayer("video").setup({
				file: "<?php echo $videoFile; ?>",
				skin: "stormtrooper",
				autostart: true<?php if($cover) { ?>,
				image: "<?php echo $cover; ?>"<?php } ?>

			});
		</script>
	</body>
</html>