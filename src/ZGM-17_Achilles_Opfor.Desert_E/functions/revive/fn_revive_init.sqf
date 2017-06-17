params ["_unit"];
if (not local _unit) exitWith {};
bis_revive_ppColor = ppEffectCreate ["ColorCorrections", 1632];
bis_revive_ppVig = ppEffectCreate ["ColorCorrections", 1633];
bis_revive_ppBlur = ppEffectCreate ["DynamicBlur", 525];

// variable clean up
if (not isNil {_unit getVariable "Achilles_var_revive_getRevived"}) then
{
	_unit setVariable ["Achilles_var_revive_getRevived", nil, true];
};
if (not isNil {_unit getVariable "Achilles_var_revive_dragged"}) then
{
	_unit setVariable ["Achilles_var_revive_dragged", nil, true];
};

_unit addEventHandler ["HandleDamage", 
{
	params ["_unit", "_selection", "_handler"];
	
	if (_handler >= 0.999) then
	{
		if (_selection in ["","body","head"] and {lifeState _unit != "INCAPACITATED"}) then 
		{
			[_unit] call Achilles_fnc_revive_startUnconsciousness;
		};
		_handler = 0.999;
	};
	_handler;
}];

if (isPlayer _unit) then 
{	
	[
		_unit,				
		"Respawn",	
		"\a3\ui_f\data\IGUI\Cfg\holdactions\holdAction_forceRespawn_ca.paa",			
		"\a3\ui_f\data\IGUI\Cfg\holdactions\holdAction_forceRespawn_ca.paa",			
		"lifeState _target == ""INCAPACITATED"" and {_this == _target}",	
		"lifeState _target == ""INCAPACITATED"" and {_caller == _target}",	
		{},		
		{},		
		{
			params ["_unit"];
			
			[_unit, true] call Achilles_fnc_revive_endUnconsciousness;	
		},
		{},
		[],
		3,
		20,
		false,
		true
	] call BIS_fnc_holdActionAdd;
};

private _id = [_unit] remoteExecCall ["Achilles_fnc_revive_addActions", 0, _unit];
_unit setVariable ["Achilles_var_revive_actionJipId", _id];