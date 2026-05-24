// JavaScript Document
function objeto(id){ 
	return document.getElementById(id); 
}


/* DIREÇÕES DO AVATAR
1 - left;
2 - up;
3 - right;
4 - down;
 */

var vocacao = { guerreiro : {	life:1000,
								mana:100,
								fist:100,
								magiclevel:1},
								
				mago : 		{	life:500,
								mana:500,
								fist:10,
								magiclevel:10}
			  };
			  
var posicaoInicial = {	player1 : {	x:4,
									y:5,
									dirInic:1 },
									
						player2 : { x:14,
									y:5,
									dirInic:1 }
					 };

var timerDanos = new Array();
var contadorDanos=-1;
var tamanhoTela = {x : 1000, y: 600};
var tamanhoTile = 50;
var contadorTiles=-1;

var objetos = [];

function randomMapFire(num){
	var existentes = [];
	var aux;
	var randomX;
	var randomY;
	var xy;
	var info = new infoobjeto('FOGO',100);
	var tipo;
	for (aux=1;aux<=num;aux++){
		randomX = Math.floor( Math.random() * (tamanhoTela.x/tamanhoTile) ) + 1;
		randomY = Math.floor( Math.random() * (tamanhoTela.y/tamanhoTile) ) + 1;
		xy = randomX+','+randomY;
		criaTile(info,'fire-'+aux,'fire tile',randomX,randomY,false,'',false,0);
	}
}

function infoobjeto(nome,dano){
	this.nome = nome;
	this.dano = dano;
}

function tipoobjeto(info,xy,tangivel){ /* Tipo de Tile - usada na função CriaTile */
		this.info = info;
		this.xy = xy;
		this.tangivel = tangivel;
	}

function Player(jogador,vocation){
	
	this.name = jogador;
	this.me = document.getElementById(jogador); /* Seta o objeto relacionado à variável */
	this.x = posicaoInicial[jogador].x; /* Coordenada X do objeto, dentro da DIV */
	this.y = posicaoInicial[jogador].y; /* Coordenada Y do objeto, dentro da DIV */
	this.lifeInic = vocacao[vocation].life;
	this.manaInic = vocacao[vocation].mana;
	this.life = vocacao[vocation].life;
	this.mana = vocacao[vocation].mana;
	this.fist = vocacao[vocation].fist;
	this.magiclevel = vocacao[vocation].magiclevel;
	objeto('life'+jogador).innerHTML = this.life;
	objeto('mana'+jogador).innerHTML = this.mana;
	
	/* Resolvi dividir as funções para andar em X e Y, para melhorar o desempenho.
	   Assim o browser não precisa ler a posição total do objeto, apenas a que foi alterada */
	   
	this.changeX = function(a){
		if((a>-2)&&(a<2)){
			if(!verificaChoque(this.x + a,this.y)){
				this.x = this.x + a; 
				if (this.x>=(tamanhoTela['x'] / tamanhoTile)) {this.x=0} 
				else if (this.x<0) {this.x=((tamanhoTela['x'] / tamanhoTile)-1)}
				this.me.style.left = (this.x * tamanhoTile) + 'px ';
				if (a==1) { 
					if(this.direction!=3) { this.setDirection(3) }
				} else if(a==-1){ 
					if(this.direction!=1) { this.setDirection(1) }
				}
				verificaTile(this.x+','+this.y,this.name);
			}
		} else {		
		this.x = a;
		if (this.x>=(tamanhoTela['x'] / tamanhoTile)) {this.x=0}
		else if (this.x<0) {this.x=((tamanhoTela['x'] / tamanhoTile)-1)}
		this.me.style.left = (this.x * tamanhoTile) + 'px ';
		
		}
	}

	this.changeY = function(b){
		if((b>-2)&&(b<2)){
			if(!verificaChoque(this.x,this.y+b)){
				this.y = this.y + b;
				if (this.y>=(tamanhoTela['y'] / tamanhoTile)) {this.y=0} 
				else if (this.y<0) {this.y=(tamanhoTela['y'] / tamanhoTile)-1}
				this.me.style.top = (this.y * tamanhoTile) + 'px';
				if (b==1) { 
					if(this.direction!=4) { this.setDirection(4) }
				} else if(b==-1){ 
					if(this.direction!=2) { this.setDirection(2) }
				}
				verificaTile(this.x+','+this.y,this.name);
			}
		} else {
		
			this.y = b;
			if (this.y>=(tamanhoTela['y'] / tamanhoTile)) {this.y=0}
			else if (this.y<0) {this.y=(tamanhoTela['y'] / tamanhoTile)-1}
			this.me.style.top = (this.y * tamanhoTile) + 'px';
					
		}
	}
	
	/* Essa função seta a posição total do objeto */
	this.setPos = function(a,b){
		this.changeX(a);
		this.changeY(b);
	}
	
	/* Essa função ainda não tem resultado visual, mas setará a direção do avatar (quando for iamgem) */
	this.setDirection = function(l){
		this.me.style.backgroundPosition = (l * tamanhoTile) + "px 0px";
		this.bgpos = this.me.style.backgroundPosition.split(" ");
		this.bgposX = this.bgpos[0].match(/\d/g).join('');
		this.bgposY = this.bgpos[1].match(/\d/g).join('');
		this.direction = l;
	}
	
	this.setPos(posicaoInicial[jogador]['x'],posicaoInicial[jogador]['y']);
	this.setDirection(posicaoInicial[jogador]['dirInic']);
		
}

function verificaTile(xy,jogador){
	var auxiliar;
	var vitima = (jogador=="player1")?"jogador1":"jogador2";
	for(auxiliar=0;auxiliar<objetos.length;auxiliar++){
		if((objetos[auxiliar].xy==xy)&&(objetos[auxiliar].info.dano>0)){
			hita(objetos[auxiliar].info.dano,vitima);
		}
	}
}

function verificaChoque(x,y){
	var xy = x + ',' + y;
	var auxiliar;
	var achou=false;
	for(auxiliar=0;auxiliar<objetos.length;auxiliar++){
		if((objetos[auxiliar].xy==xy)&&(objetos[auxiliar].tangivel==true)){
			achou=true;
		}
	}
	if(achou){return true} else {return false}
/*	if(objetos.indexOf(xy)!=-1){return true} else {return false}*/
}

function verificaProximidade(){
		var verificaX = (Math.abs(jogador1.x-jogador2.x)==1||jogador1.x-jogador2.x==0)?true:false;		
		var verificaY = (Math.abs(jogador1.y-jogador2.y)==1||jogador1.y-jogador2.y==0)?true:false;
		if(verificaX&&verificaY){return true} else {return false}
	}
	
function criaTile (tipoobj, id , classe , x , y , tangivel , content , deletavel , timing) {
	
	var xy = x + ',' + y;
	
	objetos[objetos.length] = new tipoobjeto(tipoobj,xy,tangivel);
	
	
/*	if (tangivel==true) {
		objetos.push(xy); /* x + y 
	}*/
	var divNova = '<div class="'+classe+'" id="'+id+'">'+content+'</div>';
	objeto('hits').innerHTML = objeto('hits').innerHTML + divNova;	
	objeto(id).style.top = (y * tamanhoTile) + 'px';
	objeto(id).style.left = (x * tamanhoTile) + 'px';
	if(deletavel){
		setTimeout(function(){deletaTile(id);},timing)	
	}
}

function deletaTile (id) {
	var coord = id.split('_');
	var xy = coord[0] + ',' + coord[1];
	var auxiliar;
	objeto(id).style.display = 'none';
	for(auxiliar=0;auxiliar<objetos.length;auxiliar++){
		if(objetos[auxiliar].xy==xy){ objetos.splice(auxiliar,1); }	
	}
}

/* Poderes */

function hita(dano,jogador) {
	var vitima = (jogador=="jogador1")?jogador1:jogador2;
	var numVitima = (jogador=="jogador1")?"1":"2";
	var vencedor = (jogador=="jogador1")?'jogador2':'jogador1';
	var x = vitima.x;
	var y = vitima.y - 1;
	contadorDanos++;
	var id = 'hit' + contadorDanos;
	vitima.life -= dano;
	objeto('lifeplayer'+numVitima).innerHTML = vitima.life;
	objeto('somPunch').play();
	if (vitima.life<=0) { alert('Vitória do ' + vencedor); window.location.reload(); }
	geraHit(x,y,dano,id,numVitima);
}
	
function fistAtk(jogador){
	
	var defensor = (jogador=="jogador1")?jogador2:jogador1;
	var atak = (jogador=="jogador1")?jogador1:jogador2;
	var vitima = (jogador=="jogador1")?"2":"1";
	var calculoDeDano = Math.round(	(	Math.random()	*	atak.fist	)	+	1	);
	var auxiliarVitima = (jogador=="jogador1")?"jogador2":"jogador1";
	hita(calculoDeDano,auxiliarVitima);
}

function geraHit(x,y,hit,id,vitima){
	var nomeObj = 'hit';
	var danoObj = 0;
	var tipoobj = new infoobjeto(nomeObj,danoObj);
	var classe = nomeObj + vitima;
	var novaId = x + '_' + y + '_' + id;
	criaTile(tipoobj,novaId,classe,x,y,false,hit,true,2000);
}

function heal(jogador){
	var player = (jogador=="jogador1")?jogador1:jogador2;
	if (player.mana>=25){
		player.mana-=25;
		player.life+=Math.round(	(	Math.random()	*	1000	)	+	1	);		
		var numJogador = (jogador=="jogador1")?"1":"2";
		objeto('lifeplayer'+numJogador).innerHTML = player.life;
		objeto('manaplayer'+numJogador).innerHTML = player.mana;
	}
}

function recuperaMana(){
	if(jogador1.mana<jogador1.manaInic){
		jogador1.mana+=1;
		objeto('manaplayer1').innerHTML = jogador1.mana;
	}
	if(jogador2.mana<jogador2.manaInic){
		jogador2.mana+=1;
		objeto('manaplayer2').innerHTML = jogador2.mana;
	}
}

function firegun(jogador) {
	var manawaste = 50;
	var player = (jogador=="jogador1")?jogador1:jogador2;
	var otherplayer = (jogador=="jogador1")?jogador2:jogador1;
	var otherplayername = (jogador=="jogador1")?'jogador2':'jogador1';
	var tiles = [];
	var tileTangivel = false;
	var deletavel = true;
	var tempoDeletar = 500; /* em milissegundos */
	var classe = 'fire tile';
	var conteudoTile = '';
	var tamanhoSquare = 3;
	
	var calculoDeDano = Math.round(	Math.random()	*	1000 * player.magiclevel	)	+	1;
	
	var tipoobj = new infoobjeto('fire',calculoDeDano);

	var aux=1;
	
	function golpeEsquerda(){
		contadorTiles++;
		var x = player.x+aux;
		var y = player.y;
		var novaId = x + '_' + y + '_fire' + contadorTiles;
		criaTile(tipoobj,novaId,classe,x,y,tileTangivel,conteudoTile,deletavel,tempoDeletar);
		if((otherplayer.x==x)&&(otherplayer.y==y)){
			hita(calculoDeDano,otherplayername);
		}
	}
	function golpeCima(){
		contadorTiles++;
		var x = player.x;
		var y = player.y+aux;
		var novaId = x + '_' + y + '_fire' + contadorTiles;
		criaTile(tipoobj,novaId,classe,x,y,tileTangivel,conteudoTile,deletavel,tempoDeletar);
		if((otherplayer.x==x)&&(otherplayer.y==y)){
			hita(calculoDeDano,otherplayername);
		}
	}
	function golpeDireita(){
		contadorTiles++;
		var x = player.x+aux;
		var y = player.y;
		var novaId = x + '_' + y + '_fire' + contadorTiles;
		criaTile(tipoobj,novaId,classe,x,y,tileTangivel,conteudoTile,deletavel,tempoDeletar);
		if((otherplayer.x==x)&&(otherplayer.y==y)){
			hita(calculoDeDano,otherplayername);
		}	
	}
	function golpeBaixo(){
		contadorTiles++;
		var x = player.x;
		var y = player.y+aux;
		var novaId = x + '_' + y + '_fire' + contadorTiles;
		criaTile(tipoobj,novaId,classe,x,y,tileTangivel,conteudoTile,deletavel,tempoDeletar);
		if((otherplayer.x==x)&&(otherplayer.y==y)){
			hita(calculoDeDano,otherplayername);
		}	
	}
	
	if(player.mana>=20){
		player.mana-=20;
		var numJogador = (jogador=="jogador1")?"1":"2";
		objeto('lifeplayer'+numJogador).innerHTML = player.life;
		objeto('manaplayer'+numJogador).innerHTML = player.mana;
		switch(player.direction){
			case 1:
				for(aux=-1;aux>=-3;aux--){
					golpeEsquerda();
				} break;
			case 2:
				for(aux=-1;aux>=-3;aux--){					
					golpeCima();	
				} break;
			case 3:
				for(aux=1;aux<=3;aux++){
					golpeDireita();	
				} break;
			case 4:
				for(aux=1;aux<=3;aux++){
					golpeBaixo();	
				} break;
		}
	}
}

function movimentacao(e){

	var tecla;	

	if(window.event) // IE8 and earlier
	{
		tecla = e.keyCode;
	}
	else if(e.which) // IE9/Firefox/Chrome/Opera/Safari
	{
		tecla = e.which;
	}
	
	/* Controles Jogador 1 */
	
	if (((tecla>36)&&(tecla<41))||(tecla==46)||(tecla==45)||(tecla==36)) {
		switch (tecla){
			case 37: jogador1.changeX(-1); break;
			case 38: jogador1.changeY(-1); break;
			case 39: jogador1.changeX(1); break;
			case 40: jogador1.changeY(1); break;
			case 46: if (verificaProximidade()) { fistAtk('jogador1') } break;
			case 45: firegun('jogador1'); break;
			case 36: heal('jogador1'); break;			
		}
	}
	
	/* Controles Jogador 2 */
	
	if (String.fromCharCode(tecla).match(/[A-z]/) != null ) {
		switch (String.fromCharCode(tecla)){
			case "A": jogador2.changeX(-1); break;
			case "W": jogador2.changeY(-1); break;
			case "D": jogador2.changeX(+1); break;
			case "S": jogador2.changeY(+1); break;
			case "Q": if(verificaProximidade()) { fistAtk('jogador2') } break;
			case "E": firegun('jogador2'); break;
			case "F": heal('jogador2'); break;
		}
	}
}

window.onkeydown = movimentacao;