-- Função SECURITY DEFINER para criar usuários sem service_role no app
CREATE OR REPLACE FUNCTION criar_usuario_perfil(
  p_email    TEXT,
  p_senha    TEXT,
  p_nome     TEXT,
  p_role     user_role,
  p_setor_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id     UUID;
  v_caller_role user_role;
BEGIN
  v_caller_role := get_my_role();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'gestor') THEN
    RETURN json_build_object('error', 'Sem permissão.');
  END IF;

  IF v_caller_role = 'gestor' AND p_role = 'admin' THEN
    RETURN json_build_object('error', 'Gestores só podem criar Gestores e Líderes.');
  END IF;

  v_user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id, id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change,
    is_sso_user, is_anonymous
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    v_user_id, 'authenticated', 'authenticated', p_email,
    crypt(p_senha, gen_salt('bf')),
    NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{}'::jsonb,
    NOW(), NOW(), '', '', '', '', false, false
  );

  INSERT INTO auth.identities (
    id, user_id, provider_id, provider, identity_data,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    gen_random_uuid(), v_user_id, p_email, 'email',
    jsonb_build_object('sub', v_user_id::text, 'email', p_email, 'email_verified', true),
    NOW(), NOW(), NOW()
  );

  INSERT INTO perfis (id, nome, email, role, setor_id, primeiro_acesso, ativo)
  VALUES (v_user_id, p_nome, p_email, p_role, p_setor_id, TRUE, TRUE);

  RETURN json_build_object('success', true, 'user_id', v_user_id::text);
EXCEPTION
  WHEN unique_violation THEN
    RETURN json_build_object('error', 'Email já cadastrado.');
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

-- Função para ativar/desativar usuário (gestor gerencia líderes)
CREATE OR REPLACE FUNCTION toggle_usuario_ativo(p_user_id UUID, p_ativo BOOLEAN)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_caller_role user_role;
  v_target_role user_role;
BEGIN
  v_caller_role := get_my_role();

  IF v_caller_role IS NULL OR v_caller_role NOT IN ('admin', 'gestor') THEN
    RETURN json_build_object('error', 'Sem permissão.');
  END IF;

  SELECT role INTO v_target_role FROM perfis WHERE id = p_user_id;

  IF v_caller_role = 'gestor' AND v_target_role = 'admin' THEN
    RETURN json_build_object('error', 'Gestores não podem gerenciar Admins.');
  END IF;

  UPDATE perfis SET ativo = p_ativo WHERE id = p_user_id;

  RETURN json_build_object('success', true);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('error', SQLERRM);
END;
$$;

REVOKE EXECUTE ON FUNCTION criar_usuario_perfil FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION criar_usuario_perfil TO authenticated;
REVOKE EXECUTE ON FUNCTION toggle_usuario_ativo FROM PUBLIC;
GRANT  EXECUTE ON FUNCTION toggle_usuario_ativo TO authenticated;
